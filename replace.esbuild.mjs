/**
 * This file can be edited to adjust the ESBuild build process.
 * To reset, delete this file and rerun theia build again.
 */
import { browserOptions, watch } from './gen-esbuild.browser.mjs';
import { nodeOptions } from './gen-esbuild.node.mjs';
import esbuild from 'esbuild';
import { readFileSync, existsSync } from 'node:fs';
import postcss from 'postcss';
import postcssModules from 'postcss-modules';
import path from 'node:path';

// Кастомный плагин для CSS Modules в Theia
const cssModulesPlugin = {
    name: 'theia-css-modules',
    setup(build) {

        // ШАГ 1: RESOLVE — находим .module.css файл
        // TypeScript компилирует .tsx в lib/, но CSS остаётся в src/
        // Перенаправляем из lib/ в src/
        build.onResolve({ filter: /\.module\.css$/ }, (args) => {
            console.log(`\n[CSS-MODULES] === RESOLVE ===`);
            console.log(`[CSS-MODULES] args.path: ${args.path}`);
            console.log(`[CSS-MODULES] args.importer: ${args.importer}`);

            let dir = path.dirname(args.importer);

            // Если импорт из lib/ — перенаправляем в src/
            const parts = dir.split(path.sep);
            const libIndex = parts.lastIndexOf('lib');
            if (libIndex !== -1) {
                parts[libIndex] = 'src';
                dir = parts.join(path.sep);
                console.log(`[CSS-MODULES] Redirected lib -> src: ${dir}`);
            }

            const resolvedPath = path.resolve(dir, args.path);
            console.log(`[CSS-MODULES] Resolved path: ${resolvedPath}`);
            console.log(`[CSS-MODULES] File exists: ${existsSync(resolvedPath)}`);

            if (!existsSync(resolvedPath)) {
                return {
                    errors: [{ text: `[CSS-MODULES] File not found: ${resolvedPath}` }]
                };
            }

            return {
                path: resolvedPath,
                namespace: 'theia-css-modules'
            };
        });

        // ШАГ 2: LOAD — обрабатываем CSS через postcss-modules
        // и инжектим стили в DOM
        build.onLoad({ filter: /.*/, namespace: 'theia-css-modules' }, async (args) => {
            console.log(`[CSS-MODULES] === LOAD ===`);
            console.log(`[CSS-MODULES] Loading: ${args.path}`);

            const css = readFileSync(args.path, 'utf8');
            let json = {};

            const result = await postcss([
                postcssModules({
                    generateScopedName: '[name]__[local]___[hash:base64:5]',
                    getJSON(cssFileName, _json) {
                        json = _json;
                    }
                })
            ]).process(css, { from: args.path });

            console.log(`[CSS-MODULES] Generated classes:`, Object.keys(json));

            // Экранируем CSS для безопасной вставки в template literal
            const cssContent = result.css
                .replace(/\\/g, '\\\\')
                .replace(/`/g, '\\`')
                .replace(/\$/g, '\\$');

            const moduleId = path.basename(args.path);

            // Возвращаем JS-модуль, который:
            // 1. Инжектит CSS-стили в DOM (один раз на модуль)
            // 2. Экспортирует маппинг классов
            return {
                contents: `
                    if (typeof document !== 'undefined' && !document.querySelector('style[data-css-module="${moduleId}"]')) {
                        const style = document.createElement('style');
                        style.setAttribute('data-css-module', '${moduleId}');
                        style.textContent = \`${cssContent}\`;
                        document.head.appendChild(style);
                    }
                    export default ${JSON.stringify(json)};
                `,
                loader: 'js',
            };
        });
    }
};

// Добавляем плагин В НАЧАЛО массива (до стандартных плагинов Theia)
browserOptions.plugins.unshift(cssModulesPlugin);

const browserContext = await esbuild.context(browserOptions);
const nodeContext = await esbuild.context(nodeOptions);

if (watch) {
    await Promise.all([
        browserContext.watch(),
        nodeContext.watch(),
    ]);
} else {
    try {
        await browserContext.rebuild();
        await browserContext.dispose();
        await nodeContext.rebuild();
        await nodeContext.dispose();
    } catch {
        process.exit(1);
    }
}
