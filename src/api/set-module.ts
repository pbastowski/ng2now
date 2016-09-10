/**

SetModule(module:String, dependencies: String[])

SetModule() is a function that must be used instead of angular.module()
before any ng2now decorators are used. It is functionally equivalent to
angular.module().

Please see the documentation for angular.module() for more details.

@param module : String

@param dependencies : String[]

*/

 export function SetModule(...args) {
    common.moduleName = args[0];
    // console.log('@SetModule', args[0]);
    return angular.module.apply(angular, args);
}

