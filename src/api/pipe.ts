/**

@Pipe(name, options)
@Filter(name, options)

Filter is an alias for Pipe. The functionality is exactly the same.

@param name
    The name (string) of the pipe or te filter.

@param providers
    An array of service class names or strings, whose singleton objects
    will be injected into the component's constructor. Please see
    the doco for `@Inject` parameter `providers` for more details.

In Angular2 pipes are pure functions that take arguments and return
a value. No mutations are allowed and no side effects. So, injections
are not very useful, because they could potentially cause side effects.

    @Pipe({ name: 'filt'})
    class Filt {
      transform(value, args) {
        return `Hello ${value} and welcome ${JSON.stringify(args)}.`
      }
    }

However, for those who want to inject services into their filters,
that can be easily accomplished as shown below.

    @Pipe({ name: 'filt', providers: ['$rootScope'] })
    class Filt {
      constructor(private $rootScope) {
        return (value, args) => {
          return `Hello ${value} and welcome ${JSON.stringify(args)}.`
        }
      }
    }

`Filter` is a synonym for the Angular2 decorator `Pipe`. Filter exists just
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
            moduleName: options.module || common.moduleName,
            pipeName:   options.name
        });

        if (options.providers && options.providers instanceof Array) {
            target = Inject(options.providers)(target);
        }

        common.angularModule(options.module || common.moduleName).filter(
            options.name,
            target.prototype.transform ? function () { return target.prototype.transform } : target
        );

        return target
    }
}

export const Filter = Pipe
