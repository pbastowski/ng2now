// Fake exports for CDN users and manual loaders
//if (typeof exports === 'undefined') var exports = {};

const SERVICE_PREFIX = 'service';
const ANNOTATION     = '$$ng2now';
const common         = {
    moduleName:       '',
    angularModule:    angular.module,
    serviceId:        0,
    controllerAs:     'vm',
    uiRouterTemplate: '<div ui-view=""></div>'
};

// Add an $$ng2now object to the target, which will hold all custom annotations
function decorate(target, options) {
    target[ANNOTATION] = target[ANNOTATION] || {};
    if (!options)
        return target[ANNOTATION];
    target[ANNOTATION] = Object.assign({}, target[ANNOTATION] || {}, options);
}

function camelCase(s) {
    return s.replace(/-(.)/g, (a, b) => b.toUpperCase());
}
