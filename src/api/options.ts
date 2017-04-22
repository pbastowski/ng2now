function options(options) {
    if (!options)
        return Object.assign({}, common);

    if (options.hasOwnProperty('controllerAs'))
        common.controllerAs = options.controllerAs;

    if (options.uiRouterTemplate)
        common.uiRouterTemplate = options.uiRouterTemplate;
}

