// Polyfill Object.assign, if necessary, such as in IE11
if (typeof Object.assign != 'function') {
    Object.assign = function (target) {
        'use strict';
        if (target == null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }

        target = Object(target);
        for (var index = 1; index < arguments.length; index++) {
            var source = arguments[index];
            if (source != null) {
                for (var key in source) {
                    if (Object.prototype.hasOwnProperty.call(source, key)) {
                        target[key] = source[key];
                    }
                }
            }
        }
        return target;
    };
}

// Fake exports for CDN users and manual loaders
if (!exports) exports = {};

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

export function SetModule(...args) {
    common.moduleName = args[0];
    // console.log('@SetModule', args[0]);
    return angular.module.apply(angular, args);
}

export function Component(selector, options = {}) {

    // Allow selector to be passed as string before the options or as part of the options
    if (typeof selector === 'object') {
        options  = Object.assign({}, selector);
        selector = options.selector;
    }

    // console.log('@Component: ', selector);
    return function (target, name) {
        options.providers = options.providers || options.inject;
        if (options.providers) {
            target = Inject(options.providers)(target);
        }

        // The name used when creating the component must be camelCased
        let componentName = camelCase(selector || '') + '';

        decorate(target, {
            selector,

            moduleName: common.moduleName,

            // If bootstrap==true, it means that @State should create a default
            // template `<div ui-view></div>` instead of using the selector as the template.
            bootstrap: options.bootstrap || options.root,

            template:    options.template,
            templateUrl: options.templateUrl,
            inputs:      options.inputs
        });

        // `inputs` replaces `bindings` and assumes "<" one directional input binding
        // The input can be supplied in two ways: as the name and also as the name with an annotation.
        // If only the name is supplied then the annotation is assumed to be "<".
        // For example: "xxx" or "xxx:&" or "xxx:@" or "xxx:<" or "xxx:=?" or "xxx:<yyy"
        if (options.inputs && options.inputs instanceof Array) {
            options.bindings = {};
            options.inputs.forEach(input=>options.bindings[input.split(':')[0]] = input.split(':')[1] || '<')
            //console.log('@Component: bindings: ', selector, options.bindings)
        }

        //console.log('@ Component: ', selector, options)

        common.angularModule(common.moduleName).component(
            componentName,
            angular.extend({
                controller:   target,
                controllerAs: common.controllerAs,
                template:     ''
            }, options)
        );

        return target;
    }
}
export function Directive(selector, options = {}) {

    // Allow selector to be passed as string before the options or as part of the options
    if (typeof selector === 'object') {
        options  = Object.assign({}, selector);
        selector = options.selector;
    }

    return function DirectiveTarget(target) {
        let isClass = false;
        let directiveName;

        // Selector name may be prefixed with a '.', in which case "restrict: 'C'" will be used
        if (selector[0] === '.') {
            isClass  = true;
            selector = selector.slice(1);
        }

        // The name used when creating the driective must be camelCased
        directiveName = camelCase(selector || '') + '';
        //console.log('@Directive: ', directiveName, options.selector, selector);

        // Add optional injections
        if (options.providers && options.providers instanceof Array) {
            target = Inject(options.providers)(target);
        }

        // `inputs` replaces `bindings` and assumes "<" one directional input binding
        // The input can be supplied in two ways: as the name and also as the name with an annotation.
        // If only the name is supplied then the annotation is assumed to be "<".
        // For example: "xxx" or "xxx:&" or "xxx:@" or "xxx:<" or "xxx:=?" or "xxx:<yyy"
        if (options.inputs && options.inputs instanceof Array) {
            options.bindings = {};
            options.inputs.forEach(input=>options.bindings[input.split(':')[0]] = input.split(':')[1] || '<')
        }

        decorate(target, {
                        selector,
                        directiveName,
            moduleName: common.moduleName
        });

        // Create the angular directive
        const ddo = {
            // Don't set controllerAs on directive, as it should inherit from the parent
            controllerAs:     options.controllerAs,
            // Always bind to controller
            bindToController: options.bindings || options.bindToController ? true : true,
            restrict:         isClass ? 'C' : 'A',
            scope:            options.bindings || (options.hasOwnProperty('scope') ? options.scope : undefined),
            template:         options.template,
            templateUrl:      options.templateUrl,
            controller:       target,
            replace:          options.replace,
            require:          options.require,
            link:             options.link,
            transclude:       options.transclude
        };

        // console.log('@Directive: ddo: ', directiveName, Object.assign({}, ddo));

        try {
            common.angularModule(common.moduleName).directive(directiveName, function () {
                return ddo
            });
        } catch (er) {
            throw new Error('Does module "' + common.moduleName + '" exist? You may need to use SetModule("youModuleName").');
        }

        return target;

    };
}
export function Injectable(name, options = {}) {
    if (typeof name === 'object') {
        options = Object.assign({}, name);
        name    = options.name;
    }
    name = name || common.moduleName + '_' + SERVICE_PREFIX + '_' + common.serviceId++;

    return function (target) {
        decorate(target, {
            serviceName: name
        });
        target.serviceName = name;

        // Add optional injections
        if (options.providers && options.providers instanceof Array) {
            target = Inject(options.providers)(target);
        }

        common.angularModule(common.moduleName).service(
            name,
            target
        );

        return target
    }
}

export function Inject(...args) {
    let deps;

    if (args[0] instanceof Array) {
        deps = args[0];
    } else {
        deps = args;
    }

    if (deps.length === 0) {
        throw new Error('@Inject: No dependencies passed in');
    }

    return function InjectTarget(target, name, descriptor) {
        if (descriptor) {
            throw new TypeError('@Inject can only be used with classes or class methods.');
        }

        let injectable        = target;
        const existingInjects = injectable.$inject;

        injectable.$inject = [];

        deps.forEach(dep => {
            // Lookup angularjs service name if an object was passed in
            if (typeof dep === 'function') {
                let serviceName = decorate(dep).serviceName;

                // If the object passed in is a class that was not decorated
                // with @Injectable, then we decorate it here. So, plain classes
                // can also be injected without any prior annotation - good for testing.
                if (!serviceName) {
                    dep         = Injectable()(dep);
                    serviceName = decorate(dep).serviceName;
                }
                dep = serviceName;
            }
            // Only push unique service names
            if (injectable.$inject.indexOf(dep) === -1) {
                injectable.$inject.push(dep);
            }
        });

        if (existingInjects) {
            injectable.$inject = injectable.$inject.concat(existingInjects);
        }

        // console.log('@Inject: 3: $inject: ', injectable.$inject);

        return target;
    };
}
export function Pipe(options = {}) {

    if (typeof options === 'string') {
        options = {
            name: options
        };
    }

    return function (target) {
        decorate(target, {
            moduleName: common.moduleName,
            pipeName:   options.name
        });

        common.angularModule(common.moduleName).filter(
            options.name, target
            //function () { return target.prototype.transform } :
        );

        return target
    }
}

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
/**
 * Bootstraps the Angular 1.x app.
 *
 * @param ?target   undefined | string | class
 *      undefined:  bootstraps on document and the current angular module
 *      string:     will use document.querySelector to find the element by this string
 *      class:      bootstraps on the component defined on this class, looks for selector
 *
 * @param ?config   angular.bootstrap() config object, see AngularJS doco
 */
export function bootstrap(target, config) {
    let bootOnDocument = false;

    // console.log('@Bootstrap: target: ', decorate(target).selector, decorate(target).moduleName)

    // Take care of bootstrapping on a class without a Component annotation
    if (!target || (target && !decorate(target).selector && typeof target === 'function')) {
        target         = decorate(target || {}, {selector: common.moduleName});
        bootOnDocument = true;
    }

    // Allow string shortcut for decorate(target).selector. Can be the name of any HTML tag.
    if (typeof target === 'string') {
        target = {
            selector: target
        };
    }

    // Mark this class as a bootstrap component. This allows @State
    // to handle it correctly.
    decorate(target, {bootstrap: true});

    const bootModule = decorate(target).selector || common.moduleName;

    // console.log('@Bootstrap: bootModule: ', bootModule, decorate(target).selector)

    if (bootModule !== common.moduleName) {
        common.angularModule(bootModule);
    }

    if (!config) {
        config = {
            strictDi: false
        };
    }

    common.isCordova = typeof cordova !== 'undefined';

    if (common.isCordova) {
        angular.element(document).on('deviceready', onReady);
    } else {
        angular.element(document).ready(onReady);
    }

    function onReady() {
        let el;

        if (!bootOnDocument) {
            // Find the component's element
            el = document.querySelector(decorate(target).selector);
        } else {
            // Or use document, if user passed no arguments
            el = document.body;
        }

        angular.bootstrap(el, [bootModule], config);
    }
}

var ng2now = {
    options,
    SetModule,
    Component,
    Directive,
    Inject,
    Injectable,
    Pipe,
    State,
    bootstrap,

    Service: Injectable,
    Filter: Pipe,
    RouterConfig: State
};

export default ng2now;

window.ng2now = ng2now;

// Legacy support for angular2-now users
window.angular2now = ng2now;
