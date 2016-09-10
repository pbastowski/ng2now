/**

@Component(options)

Creates an AngularJS component in the module set with the last call to
SetModule(). Internally, angular.module().component() is called to
create the component described with this decorator.

The `options` argument is a literal object that can have the following
parameters, in addition to those accepted by the AngularJS component()
method.

@param selector
    The kebab-cased name of the element as you will use it in
    your html. ex: "my-app" or "home-page".

@param providers
@param inject
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
@param routerConfig
    For details please see the documentation for @State.

For other parameters that you can specify, please refer to the AngularJS
documentation for component() for further details.

** Note that controllerAs is set to "vm" by ng2now. You can change this
by using ng2now.options(). See options() documentation for details.

Examples:

    @Component

*/
export function Component(selector, options = {}) {

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
