export function Pipe(options = {}) {

    if (typeof options === 'string') {
        options = {
            name: options
        };
    }

    return function (target) {
        decorate(target, {
            moduleName: common.moduleName,
            pipeName:   options.name
        });

        common.angularModule(common.moduleName).filter(
            options.name, target
            //function () { return target.prototype.transform } :
        );

        return target
    }
}

