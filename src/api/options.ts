export function options(options) {
    if (!options)
        return Object.assign({}, common);

    if (options.hasOwnProperty('controllerAs'))
        common.controllerAs = options.controllerAs;

    // The noConflict option allows us to control whether or not angular2-now
    // monkey-patches angular.module.
    //  true = restore the original angular.module
    if (options.hasOwnProperty('noConflict') && options.noConflict)
        angular.module = common.angularModule;

    if (options.uiRouterTemplate)
        common.uiRouterTemplate = options.uiRouterTemplate;
}

