const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function (name: string) {
    if (typeof name === 'string' && name.endsWith('.css')) {
        return {};
    }
    return originalRequire.apply(this, arguments as any);
};