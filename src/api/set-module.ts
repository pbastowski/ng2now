export function SetModule(...args) {
    common.moduleName = args[0];
    // console.log('@SetModule', args[0]);
    return angular.module.apply(angular, args);
}

