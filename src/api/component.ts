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
