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

@param ?defaultRoute : Boolean | String
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
        name: 'home', url: '/home', defaultRoute: true,
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
