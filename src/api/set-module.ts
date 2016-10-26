/**

SetModule(module:String, dependencies: String[])

SetModule() is a function that must be used instead of angular.module()
before any ng2now decorators are used. It is functionally equivalent to
angular.module().

Please see the documentation for angular.module() for more details.

If used without any arguments, SetModule() will return a reference to the
last set angular module. That is, if you did this `SetModule('app')`,
then `SetModule()` will return `angular.module('app')`.

@param module : String

@param dependencies : String[]

Example:

    import { SetModule } from 'ng2now';

    SetModule('app', ['ui.router']);

*/

 export function SetModule(...args) {
    if (args.length===0)
            return angular.module(common.moduleName)

    common.moduleName = args[0]
    // console.log('@SetModule', args[0]);
    return angular.module.apply(angular, args);
}

