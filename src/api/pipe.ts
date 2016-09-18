/**

Pipe(options) or
Filter(options)

@param name
    The name (string) of the pipe or te filter.

@param providers
    An array of service class names or strings, whose singleton objects
    will be injected into the component's constructor. Please see
    the doco for `@Inject` parameter `providers` for more details.

@param module
    This is the name of an angular module that you want to create this
    pipe in. In most cases you don't want to specify this, because
    it is already specified using SetModule(), but if you need to then
    this is where you do it. It is your responsibility to ensure that
    this module exists. Create an angular module like this:
    `angular.module('your-module-name', [])`.

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