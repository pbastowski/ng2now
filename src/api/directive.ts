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
