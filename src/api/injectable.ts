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
export function Injectable(name, options = {}) {
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

export const Service = Injectable
