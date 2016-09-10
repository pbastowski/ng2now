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

        if (typeof target === 'function')
            common.angularModule(common.moduleName).service(
                name,
                target
            );
        else
            common.angularModule(common.moduleName).value(
                name,
                target
            );

        return target
    }
}

