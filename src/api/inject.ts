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
