/**
    Pipe and Filter

    In Angular2 pipes are pure functions that take arguments and return
    a value. No mutations are allowed and no side effects. So, injections
    are not very useful, because they could potentially cause side effects.

    @Pipe({ name: 'filt'})
    class Filt {
      transform(value, args) {
        return `Hello ${value} and welcome ${JSON.stringify(args)}.`
      }
    }

    However, for those who want to inject services into their filters
    that can be easily accomplished as shown below.

    @Pipe({ name: 'filt', providers: ['$rootScope'] })
    class Filt {
      constructor(private $rootScope) {
        return (value, args) => {
          return `Hello ${value} and welcome ${JSON.stringify(args)}.`
        }
      }
    }
    Filter is a synonym for the Angular2 decorator Pipe. Filter exists just
    for Angular1 nostalgic reasons.

*/


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

        if (options.providers && options.providers instanceof Array) {
            target = Inject(options.providers)(target);
        }

        common.angularModule(common.moduleName).filter(
            options.name,
            target.prototype.transform ? function () { return target.prototype.transform } : target
        );

        return target
    }
}