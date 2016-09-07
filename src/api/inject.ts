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
