// src/browser/test/setup.ts
const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function (name: string) {
    if (typeof name === 'string' && (name.endsWith('.css') || name.endsWith('.module.css'))) {
        return new Proxy({}, {
            get: (_target: any, prop: string) => prop
        });
    }
    return originalRequire.apply(this, arguments as any);
};
