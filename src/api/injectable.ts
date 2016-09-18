/**
 Injectable(options)
 Service(options)

 @Injectable marks a class as an injectable service. This is Angular2
 syntax. In ng2now it is not necessary to decorate services with
 @Injectable. Any class, or literal object, can be injected using any
 `providers` array or using @Inject. If you

 @param module
    This is the name of an angular module that you want to create this
    service in. In most cases you don't want to specify this, because
    it is already specified using SetModule(), but if you need to then
    this is where you do it. It is your responsibility to ensure that
    this module exists. Create an angular module like this:
    `angular.module('your-module-name', [])`.

 For example:

     @Injectable()  // this is optional
     @Inject( '$scope' }
     class AppService {
         todos = [];
         constructor(private $scope) {}
     }

     @Component({ selector: 'todo-list', providers: [ AppService ] })
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

 @param name
 @param options
 @returns {(target:any)=>any}
 @constructor

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

