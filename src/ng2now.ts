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
function options(options) {
    if (!options)
        return Object.assign({}, common);

    if (options.hasOwnProperty('controllerAs'))
        common.controllerAs = options.controllerAs;

    if (options.uiRouterTemplate)
        common.uiRouterTemplate = options.uiRouterTemplate;
}

/**

SetModule(module:String, dependencies: String[])

SetModule() is a function that must be used instead of angular.module()
before any ng2now decorators are used. It is functionally equivalent to
angular.module().

Please see the documentation for angular.module() for more details.

If used without any arguments, SetModule() will return a reference to the
last set angular module. That is, if you did this `SetModule('app')`,
then `SetModule()` will return `angular.module('app')`.

@param module : String

@param dependencies : String[]

Example:

    import { SetModule } from 'ng2now';

    SetModule('app', ['ui.router']);

*/

 function SetModule(...args) {
    if (args.length===0)
            return angular.module(common.moduleName)

    common.moduleName = args[0]
    // console.log('@SetModule', args[0]);
    return angular.module.apply(angular, args);
}

/**

@Component(options)
@Component(selector, options)

Creates an AngularJS component in the module set with the last call to
SetModule(). Internally, angular.module().component() is called to
create the component described with this decorator.

The `options` argument is a literal object that can have the following
parameters, in addition to those accepted by the AngularJS component()
method.

@param selector
    The kebab-cased name of the element as you will use it in
    your html. ex: "my-app" or "home-page".
    Selector can also be specified separately as the first argument to
    @Component(), followed by the options object itself.

@param providers
@param inject  (alias for providers)
    An array of service class names or strings, whose singleton objects
    will be injected into the component's constructor. Please see
    the doco for `@Inject` parameter `providers` for more details.

@param inputs
    An array of strings that represent the attribute names, whose passed
    values will be assigned to your component's controller (this).
    `inputs` can be used in place of `bindings` and assumes
    one-directional "<" input binding.
    The input can be supplied in two ways: as the name and also as the
    name with an annotation. If only the name is supplied then the
    annotation is assumed to be "<".
    For example: "xxx" or "xxx:&" or "xxx:@" or "xxx:<" or "xxx:=?"
    or "xxx:<yyy".
    See AngularJS documentation for component(), section on bindings
    for more information.

@param stateConfig
@param routerConfig  (alias for stateConfig)
    For details please see the documentation for @State.

@param module
    This is the name of an angular module that you want to create this
    component in. In most cases you don't want to specify this, because
    it is already specified using SetModule(), but if you need to then
    this is where you do it. It is your responsibility to ensure that
    this module exists. Create an angular module like this:
    `angular.module('your-module-name', [])`.

For other parameters that you can specify, please refer to the AngularJS
documentation for component() for further details.

** Note that controllerAs is set to "vm" by ng2now. You can change this
by using ng2now.options(). See options() documentation for details.

Examples:

    @Component

*/
function Component(selector, options = {}) {

    // Allow selector to be passed as string before the options or as part of the options
    if (typeof selector === 'object') {
        options  = Object.assign({}, selector);
        selector = options.selector;
    }

    // console.log('@Component: ', selector);
    return function (target, name) {
        options.providers = options.providers || options.inject;
        if (options.providers && options.providers instanceof Array) {
            target = Inject(options.providers)(target);
        }

        options.stateConfig = options.stateConfig || options.routerConfig;
        if (options.stateConfig && options.stateConfig instanceof Object) {
            target = State(options.stateConfig)(target);
        }

        // The name used when creating the component must be camelCased
        let componentName = camelCase(selector || '') + '';

        decorate(target, {
            selector,
            componentName,

            moduleName: options.module || common.moduleName,

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
            options.bindings = options.bindings || {};
            options.inputs.forEach(input=>options.bindings[input.split(':')[0]] = input.split(':')[1] || '<')
            //console.log('@Component: bindings: ', selector, options.bindings)
        }

        //console.log('@ Component: ', selector, options)

        common.angularModule(options.module || common.moduleName).component(
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
/**

@Directive( selector: string, options : Object)
@Directive( options : Object)

@Directive only creates directives and never components. If you want
to make a component then use the @Component decorator.


Examples:

// This simple input validator returns true (input is valid)
// if the input value is "ABC"
@Directive({ selector: 'valid', require: { ngModel: 'ngModel' }})
class Valid {
    $onInit() {
        this.ngModel.$validators.valid = val => val==='ABC';
    }
}

// The auto-focus directive is used to make an input receive focus
// when the page loads.
@Directive({ selector: 'auto-focus', providers: [ '$element' ]})
class AutoFocus {
    constructor(el) {
        el[[0].focus();
    }
}

 */

function Directive(selector, options = {}) {

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

        // The name used when creating the directive must be camelCased
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
            options.bindings = options.bindings || {};
            options.inputs.forEach(input=>options.bindings[input.split(':')[0]] = input.split(':')[1] || '<')
        }

        decorate(target, {
            selector,
            directiveName,
            moduleName: options.module || common.moduleName
        });

        // Create the angular directive
        const ddo = {
            // Don't set controllerAs on directive, as it should inherit from the parent
            controllerAs:     options.controllerAs,
            // Always bind to controller
            bindToController: options.bindings || true,
            restrict:         isClass ? 'C' : 'A',
            scope:            options.hasOwnProperty('scope') ? true : undefined,
            controller:       target,
            require:          options.require,
            // template:         options.template,
            // templateUrl:      options.templateUrl,
            // replace:          options.replace,
            // link:             options.link,
            // transclude:       options.transclude
        };

        // console.log('@Directive: ddo: ', directiveName, Object.assign({}, ddo));

        try {
            common.angularModule(options.module || common.moduleName).directive(directiveName, function () {
                return ddo
            });
        } catch (er) {
            throw new Error('Does module "' + (options.module || common.moduleName) + '" exist? You may need to use SetModule("youModuleName").');
        }

        return target;

    };
}
/**
 Injectable(options)
 Service(options)

 @Injectable marks a class as an injectable service. This is Angular2
 syntax. In ng2now it is not necessary to decorate services with
 @Injectable. Any class, or literal object, can be injected using any
 `providers` array or using @Inject.

 For example:

     @Injectable()  // this is optional
     @Inject( '$scope' }
     class AppService {
         todos = [];
         constructor(private $scope) {}
     }

     @Component({
        selector: 'todo-list',
        providers: [ AppService ]
     })
     class TodoList {
        constructor(private app) {
        }
     }

     const AppConfig = {
        title: 'Todos',
        version: '0.0.1'
     }

     // Here we inject a literal object
     @Component({ selector: 'nav-bar', providers: [ AppConfig ] })
     class NavBar {
         constructor(private config) {}
     }

 */
function Injectable(name, options = {}) {
    if (typeof name === 'object') {
        options = Object.assign({}, name);
        name    = options.name;
    }
    name = name || (options.module || common.moduleName) + '_' + SERVICE_PREFIX + '_' + common.serviceId++;

    return function (target) {
        decorate(target, {
            serviceName: name
        });
        target.serviceName = name;

        // Add optional injections
        if (options.providers && options.providers instanceof Array) {
            target = Inject(options.providers)(target);
        }

        if (typeof target === 'function')
            common.angularModule(options.module || common.moduleName).service(
                name,
                target
            );
        else
            common.angularModule(options.module || common.moduleName).value(
                name,
                target
            );

        return target
    }
}

const Service = Injectable
/**

@Inject(providers)

Annotates the class with the names of services that are to be injected
into the class's constructor.

@param providers   (also known as services)
    An array (or argument list) of literal objects, class names or
    strings, whose singleton objects will be injected into the
    component's constructor.
    Your literal objects or ES6 classes can be injected without prior
    decoration with @Injectable(). Classes injected in this way will
    be assigned a generated unique name that will be resolved
    automatically everywhere tah you inject that class or object using
    @Inject() or the providers array parameter.
    For more details see documentation for @Injectable and @Component.

Examples:

    class MyService {
        abc = 1234
    }

    // We inject the class object explicitly
    @Inject(MyService)
    class AppService {
        constructor(my) {
            console.log(my.abc) // --> 123
        }
    }

    // We could use `@Inject`, but `providers` does the same job
    @Component({ providers: [ MyService ] })
    class App {
        constructor(my) {
            console.log(my.abc) // --> 123
        }
    }
*/

function Inject(...args) {
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
            if (typeof dep === 'function' || typeof dep === 'object') {
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
/**

@Pipe(name, options)
@Filter(name, options)

Filter is an alias for Pipe. The functionality is exactly the same.

@param name
    The name (string) of the pipe or te filter.

@param providers
    An array of service class names or strings, whose singleton objects
    will be injected into the component's constructor. Please see
    the doco for `@Inject` parameter `providers` for more details.

In Angular2 pipes are pure functions that take arguments and return
a value. No mutations are allowed and no side effects. So, injections
are not very useful, because they could potentially cause side effects.

    @Pipe({ name: 'filt'})
    class Filt {
      transform(value, args) {
        return `Hello ${value} and welcome ${JSON.stringify(args)}.`
      }
    }

However, for those who want to inject services into their filters,
that can be easily accomplished as shown below.

    @Pipe({ name: 'filt', providers: ['$rootScope'] })
    class Filt {
      constructor(private $rootScope) {
        return (value, args) => {
          return `Hello ${value} and welcome ${JSON.stringify(args)}.`
        }
      }
    }

`Filter` is a synonym for the Angular2 decorator `Pipe`. Filter exists just
for Angular1 nostalgic reasons.

*/


function Pipe(options = {}) {

    if (typeof options === 'string') {
        options = {
            name: options
        };
    }

    return function (target) {
        decorate(target, {
            moduleName: options.module || common.moduleName,
            pipeName:   options.name
        });

        if (options.providers && options.providers instanceof Array) {
            target = Inject(options.providers)(target);
        }

        common.angularModule(options.module || common.moduleName).filter(
            options.name,
            target.prototype.transform ? function () { return target.prototype.transform } : target
        );

        return target
    }
}

const Filter = Pipe
/**

@State(options: Object)
@RouterConfig(options: Object)

State depends on ui-router 1.x, which has specific support for
routing AngularJS 1.x components. It will not work with earlier
versions of ui-router.

State can be used to annotate either a component or a class to
- configuring html5mode and requireBase parameters
- assign a ui-router state to it
- specify the default route
- provide default inputs that will be assigned to the component's
  inputs

The `options` literal object is used to provide the following standard
$stateProvider configuration parameters. Please see the ui-router 1.x
documentation for details of these standard parameters.

When used to annotate a @Component(): name, url, redirectTo, params,
abstract, resolve, onEnter, onExit, parent, data

When annotating a class that will be used as a controller, but not
annotated with @Component, the following parameters can also be
specified: template, templateUrl, templateProvider, controller,
controllerAs

In addition to standard ui-router parameters, the following parameters
can be supplied to configure your States/Routes:

@param ?otherwise : Boolean | String
@param ?defaultRoute : Boolean | String   (DEPRECATED)
    truthy = .otherwise(url)
    string = .otherwise(defaultRoute)

@param ?html5Mode : Boolean
    See $locationProvider AngularJS documentation

@param ?requireBase : Boolean
    See $locationProvider AngularJS documentation

If a class is annotated, which is not also annotated with @Component,
then it is assumed to be the controller.

Examples:

**HTML**

<body>
    <app></app>
</body>

**JavaScript**

    import { Component, SetModule, State, bootstrap, Inject } from 'ng2now';
    // or, if using a CDN then use the line below and comment out the line above
    // let { Component, SetModule, State, bootstrap, Inject } = ng2now;

    SetModule('app', ['ui.router']);

    let AppState = {
        config: { version: '1.0' },
        homepage: { stuff: 42 },
        feature: { things: [1, 2, 3, 4, 5] }
    }

    // Just configure the html5Mode using @State
    @State({ html5Mode: true, requireBase: false })

    @Component({
        selector: 'app',
        template: `
            <h1>App <small>version {{ vm.app.config.version }}</h1>
            <a ui-sref="home">Home</a> <a ui-sref="feature">Feature</a>
            <hr>
            <ui-view></ui-view>
        `,
        providers: [ AppState ]
    })
    class App {
        // Using TypeScript `private` argument syntax, which automatically
        // puts the argument `app` onto `this`. So, we don't have to code
        // `this.app = app;`
        constructor(private app) {}
    }

    // Here we configure the route for the home page. Home page is
    // the default route that we want to display when the app starts.
    // We also prepare an input, using resolve, that the component will
    // receive when ui-router instantiates it. This is a feature of
    // ui-router 1.x. So, do look at ui-router 1.x documentation for
    // more details on this new feature.
    // Another way to look at what the resolve is doing is like so:
    //    <home-page state="vm.app.homepage"></home-page>
    // The above assumes the host component's controller contains
    // a reference to app, of course.
    @State({
        name: 'home', url: '/home', otherwise: '/home',
        resolve: { state: Inject(AppState)(app=>app.homepage) }
      })

    @Component({
        selector: 'home-page', inputs: ['state'],
        template: 'Home Page<hr><p>Home state: {{ vm.state | json }}'
    })
    class HomePage {}


    // The feature component has its own route and we also prepare
    // an input using resolve. This is a feature of ui-router 1.x.
    @State({
        name: 'feature', url: '/feature',
        resolve: { state: Inject(AppState)(app=>app.feature) }
    })

    @Component({
        selector: 'feature', inputs: ['state'],
        template: 'Feature Page<hr><p>Feature state: {{ vm.state | json }}',
        providers: ['$rootScope', '$timeout']
    })
    class FeaturePage {
        constructor(private $rootScope, $timeout) {
            this.cancelSub = $timeout(()=>$rootScope.$emit('my-event'), 2000)
        }
        $onInit() {
            // do stuff with the injected $rootScope, for example
            this.$rootScope.$on('my-event', ()=>console.log('DOING stuff'))
        }
        $onDestroy() {
            this.cancelSub();
        }
    }

    bootstrap(App);
*/

function State(options = {}) {
    if (options.name === undefined
        && options.hasOwnProperty('html5Mode') === false
        && options.hasOwnProperty('html5mode') === false) {
        throw new Error('@State: valid options are: name, url, defaultRoute, otherwise, template, templateUrl, templateProvider, resolve, abstract, parent, data.');
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
                    options.defaultRoute = options.defaultRoute || options.otherwise || undefined
                    if (options.defaultRoute) {
                        $urlRouterProvider.otherwise((typeof options.defaultRoute === 'string') ? options.defaultRoute : options.url);
                    }

                    // Optionally configure html5Mode
                    if (options.hasOwnProperty('html5Mode') || options.hasOwnProperty('html5mode')) {
                        $locationProvider.html5Mode({
                            enabled:     options.html5Mode || options.html5mode,
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
                            let s    = typeof o === 'function' || typeof o === 'object' ? o.serviceName : o;
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

const RouterConfig = State
/**

bootstrap(options)

Bootstraps the Angular 1.x app.

@param ?target = undefined | "string" | ClassName

    undefined:  Bootstraps on document and the current angular module,
                as set by the last call to SetModule()
    "string":   Will use document.querySelector to find the element by
                this string and bootstrap on it.
    ClassName:  Bootstraps on the component defined on this class. The
                module name must be the same as the selector.

@param ?config

    The angular.bootstrap() config object, see AngularJS documentation.

Examples of how to bootstrap ng2now:

    SetModule('my-app', []);
    @Component({ selector: 'my-app', ... })
    class MyApp {}

    // Use the selector name, which must match the module name.
    bootstrap(MyApp)

    // Or use the element name, which must match the module name.
    bootstrap('my-app')

    // Or bootstrap on document.body and the last module name set with
    // SetModule will be assumed.
    bootstrap()

 */
function bootstrap(target, config) {
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

const ng2now = {
    options,
    SetModule,
    Component,
    Directive,
    Inject,
    Injectable,
    Pipe,
    State,
    bootstrap,

    Service,
    Filter,
    RouterConfig
};

// Node.js style
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ng2now;
    exports['def'+'ault'] = ng2now;
}
else if (typeof define !== 'undefined' && define.amd) {
    define('ng2now', [], function () {
        return ng2now;
    });
}
else if (typeof window !== 'undefined')
    window.ng2now = ng2now;