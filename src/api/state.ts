export function State(options = {}) {
    if (options.name === undefined && options.hasOwnProperty('html5Mode') === false) {
        throw new Error('@State: valid options are: name, url, defaultRoute, template, templateUrl, templateProvider, resolve, abstract, parent, data.');
    }

    return function StateTarget(target) {

        // Configure the state
        common.angularModule(common.moduleName)
            .config(['$urlRouterProvider', '$stateProvider', '$locationProvider',
                function ($urlRouterProvider, $stateProvider, $locationProvider) {
                    // Activate this state, if options.defaultRoute = true.
                    // If you don't want this then don't set options.defaultRoute to true
                    // and, instead, use $state.go inside the constructor to active a state.
                    // You can also pass a string to defaultRoute, which will become the default route.
                    if (options.defaultRoute) {
                        $urlRouterProvider.otherwise((typeof options.defaultRoute === 'string') ? options.defaultRoute : options.url);
                    }

                    // Optionally configure html5Mode
                    if (options.hasOwnProperty('html5Mode')) {
                        $locationProvider.html5Mode({
                            enabled:     options.html5Mode,
                            requireBase: options.requireBase
                        });
                    }

                    // If options.name is not supplied then we return, having possibly
                    // set other options, such as `otherwise` and `html5Mode`.
                    if (!options.name) return

                    // Construct sdo.resolve object based on `options.inputs`
                    // or its alias `options.inject`. Also, accept any initial resolve object
                    // passed in by the user.
                    let resolves = options.resolve || {};
                    let inputs   = options.inputs || options.inject;
                    // Match injected dependencies to aliases specified in the inputs array.
                    if (inputs instanceof Array) {
                        // Extract just the alias portion of each input, the part before a ":" (if present)
                        let aliases = (decorate(target).inputs || []).map(input=>input.split(':')[0]);
                        // Create "resolve" functions
                        inputs.forEach((o, i) => {
                            let n    = aliases[i];
                            let s    = typeof o === 'function' ? o.serviceName : o;
                            let inj  = s.split(':')[0]; // the service to inject
                            let expr = s.slice(inj.length + 1) || inj;  // the optional expression. if absent it's set to the service name

                            resolves[n] = [inj, Function(inj, 'return ' + expr)];
                            // console.log('@State: inputs: ', inj, expr, resolves[n][1].toString());
                        })
                    }

                    // This is the state definition object
                    const sdo = {
                        redirectTo: options.redirectTo,

                        url: options.url,

                        // Default values for URL parameters can be configured here.
                        // ALso, parameters that do not appear in the URL can be configured here.
                        params: options.params,

                        // The State applied to a bootstrap component can be abstract,
                        // if you don't want that state to be able to activate.
                        abstract: options.abstract,

                        params: options.params,

                        // Do we need to resolve stuff?
                        // Or perhaps inject providers using resolve
                        resolve: options.resolve || resolves || undefined,

                        // onEnter and onExit events
                        onEnter: options.onEnter,
                        onExit:  options.onExit,

                        // Custom parent State
                        parent: options.parent,

                        // Custom data
                        data: options.data
                   };

                    // Template is always required, but only allowed when component is not specified.
                    // So, if the target has a selector then it is assumed to be a component, otherwise
                    // it is assumed to be a state controller class, which needs an empty string template.
                    if (decorate(target).selector) {

                        if (decorate(target).bootstrap)
                            sdo.template = common.uiRouterTemplate;
                        else
                            sdo.component = camelCase(decorate(target).selector);

                    } else {

                        // We are probably decorating a class and not a component, so, a template
                        // must be supplied through options or otherwise a default one
                        // will be provided.

                        // The sdo's default "<div ui-view></div>" template can be overridden with `options.uiRouterTemplate`
                        sdo.template         = options.template || common.uiRouterTemplate || '';
                        sdo.templateUrl      = options.templateUrl;

                        // The option for dynamically setting a template based on local values
                        // or injectable services
                        sdo.templateProvider = options.templateProvider;

                        // The user can supply a controller through `options.controller`. We can also
                        // annotate State on a class without a Component annotation, in which case
                        // the class itself is the controller.
                        sdo.controller       = options.controller || (!(decorate(target)).selector ? target : undefined);

                        // `controllerAs` always defaults to `common.controllerAs`, but can be overridden
                        // through `options.controllerAs`. This is useful, for example, when we annotate
                        // State on a class that has no Component annotation. Relates to controller, above.
                        sdo.controllerAs     = options.controllerAs || common.controllerAs;

                    }

                    // Providing Template as well as either templateUrl or templateProvider is not allowed.
                    if (options.templateUrl || options.templateProvider && sdo.template) {
                        delete sdo.template;
                    }

                    // Create the state
                    $stateProvider.state(options.name, sdo);
                }
            ]);
        return target;
    };
}
