# ng2now is the concise successor to angular2-now

> ng2now is currently in beta. However, most of it is the same as angular2-now, but with support for new ui-router 1.x component routing and AngularJS 1.5's components. You will have to import from 'ng2now' instead of 'angular2-now'.
  
> In the documentation below, which was copied from the angular2-now repo, please read all references to angular2-now as ng2now. They will be updated as the documentation is cleaned up.

## Angular 2.0 component syntax for Angular 1 apps

ng2now gives you the ability to start coding your Angular 1.5+ apps using the Angular 2 component syntax. You get to keep your investment in Angular 1 while learning some Angular 2 concepts.

So, if you like the clean syntax of Angular 2, but are not yet ready or able to commit to it, then this library might just be what you're looking for.

## Install

**NPM**

    npm install ng2now
    
**CDN**

```html
<script src="https://unpkg.com/ng2now"></script>
```

## Peer dependencies

- AngularJS 1.5+
- ui-router 1.x (optional)

ng2now depends on AngularJS 1.5+.

If you are also going to use the `@State` decorator or the stateConfig/routerConfig options of the @Component decorator, then you will also have a dependency on ui-router 1.x.

## Usage with ES6 or TypeScript

You can use ng2now with **Babel** or **TypeScript**. Both work equally well.

Include ng2now in your AngularJS project, ensuring that it loads before any of it's functions are used. 

If you're not using any module loaders, then `window.ng2now` gives you direct access to all the decorators, like this:
  
```js
    let { Component, State, SetModule, bootstrap } = window.ng2now;
```

> See the **Examples and Demos** section below for examples.
 
## ng2now API

The following decorators have been implemented to support Angular 2 component syntax. Any parameters preceded with `?` are optional.

```js
// SetModule is not actually in Angular2, however it must be used 
// in place of and with the exact same syntax as angular.module().
SetModule('my-app', ['angular-meteor']);

@Component({ 
    selector: 'my-app', 
    ?template: '<div>Inline template</div>',   // inline template 
    ?templateUrl: 'path/to/the_template.html', // importing a template
    ?bind: { twoWay: '=', value: '@', function: '&' },
    ?providers: ['$http', '$q', 'myService'],  // alias for @Inject
    ?replace: true or false,
    ?transclude: true or false,
    ?scope: undefined or true or same as bind,
    ?providers: [ '$http', '$q' ],
    ?stateConfig: // all options available to @State
})

class App {
    constructor($http, $q) { }
}

bootstrap(App, ?config);  // config is optional
```

The annotations below are not Angular 2, but for me they make coding in Angular a bit nicer. 

```javascript
@Injectable({ name: 'serviceName', providers: [ MyService, '$http'] })
// @Service is an alias for @Injectable
 
@Pipe({ name: 'filterName' })
// @Filter is an alias for @Pipe
 
@Directive({ 
    selector: 'my-app',
    ?scope: true, 
    ?providers: [ MyService, '$http', '$q' ],
    ?require: 'ng-model' or ['ng-model'] or { 'ng-model: 'ngmodel' }
})

 
```

Client-side routing with ui-router 1.x

```javascript
@State({
    name: 'stateName', 
    ?url: '/stateurl', 
    ?otherwise: true or '/default/route/url',
    ?abstract: true,
    ?html5Mode: true,
    ?params: { id: 123 },  // default params, see ui-router docs
    ?data: { a: 1, b: 2},  // custom data
    ?resolve: {...}, 
    ?controller: controllerFunction, 
    ?template: '<div></div>',
    ?templateUrl: 'client/app/app.html',
    ?templateProvider: function() { return "<h1>content</h1>"; },
    ?redirectTo
}))
```

### @Component

@Component(options)
@Component(selector, options)

Creates an AngularJS component in the module set with the last call to SetModule(). Internally, angular.module().component() is called to create the component described with this decorator.

The `options` argument is a literal object that can have the following parameters, in addition to those accepted by the AngularJS component() method.

@param selector
    The kebab-cased name of the element as you will use it in your html. ex: "my-app" or "home-page".
    Selector can also be specified separately as the first argument to @Component(), followed by the options object itself.

@param providers
@param inject  (alias for providers)
    An array of service class names or strings, whose singleton objects will be injected into the component's constructor. Please see the doco for `@Inject` parameter `providers` for more details.

@param inputs
    An array of strings that represent the attribute names, whose passed values will be assigned to your component's controller (this). `inputs` can be used in place of `bindings` and assumes one-directional "<" input binding.
    The input can be supplied in two ways: as the name and also as the name with an annotation. If only the name is supplied then the annotation is assumed to be "<".
    For example: "xxx" or "xxx:&" or "xxx:@" or "xxx:<" or "xxx:=?" or "xxx:<yyy".
    See AngularJS documentation for component(), section on bindings for more information.

@param stateConfig
@param routerConfig  (alias for stateConfig)
    For details please see the documentation for @State.

@param module
    This is the name of an angular module that you want to create this component in. In most cases you don't want to specify this, because it is already specified using SetModule(), but if you need to then this is where you do it. It is your responsibility to ensure that this module exists. Create an angular module like this: `angular.module('your-module-name', [])`.

For other parameters that you can specify, please refer to the AngularJS documentation for component() for further details.

** Note that controllerAs is set to "vm" by ng2now. You can change this by using ng2now.options(). See options() documentation for details.

### @Pipe

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


## Examples and Demos

Please visit the following github repositories and Plunker examples before you start coding. It will save you some "WTF" time.

#### ES6 example

[ES6 Angular2-now Plunker](http://plnkr.co/edit/JhHlOr?p=preview)

#### Meteor examples on GitHub

[Thinkster-MEAN-Tutorial-in-angular-meteor](https://github.com/pbastowski/Thinkster-MEAN-Tutorial-in-angular-meteor/tree/feature/ng2-now-with-services)

[meteor-angular-socially](https://github.com/pbastowski/meteor-angular-socially/tree/feature/ng2now)

[todo-ng2now](https://github.com/pbastowski/todo-ng2now)


## API in-depth

### Directive

`Directive` creates new HTML attributes that can be used to decorate existing or custom elements with new behaviours. Also, directives have no template HTML. A directive is one attribute amongst any number of other attributes on an element. All directives are by default created with shared scope.

Through the options object you can provide the following arguments to the Directive decorator:
 
`selector` | the attribute name, such as "auto-focus" 
`controllerAs` | optionally specify a controllerAs different to the default "vm"
`scope` | true
`require` | A literal object map of names of other controllers that you may need the reference to, such as "ng-model", which is useful for validating input values.
 
See angular.module().directive() documentation for more information.

 ```javascript
@Directive('set-focus', { 
    providers: ['$element']
})
class SetFocus { 
    constructor($el) {
        $el.focus()
    }
}
```

### `SetModule` instead of `angular.module`

```javascript
SetModule( 'app', ['angular-meteor', 'ui.router', 'my-other-module'] )
```

> Use `SetModule` in the same places you would normally use `angular.module`.
  

You must use `SetModule` at least once in your app, before you use any decorators, to tell ng2now in which module to create all Components, Directives, Services, Pipes/Filters and State configuration. The syntax is identical to Angular's own [angular.module()](https://docs.angularjs.org/api/ng/function/angular.module). 

### ui-router 1.x support through @State

> ui-router version below 1.x are not supported.

This is completely not Angular 2, but I love how easy it makes my routing. You'll have to include ui-router 1.x in your app:

    npm install angular-ui-router@1.0.0-beta.3
    
Then add the `ui.router` dependency to your bootstrap module, like this
  
    SetModule('myApp', ['ui.router']);

And make sure that the `angular-ui-router` library is loaded before `ng2now`. 

Now, you can simply decorate your component with the route/state info, like so:

```javascript
@State({name: 'defect', url: '/defect', defaultRoute: '/defect'})

@Component({
    selector: 'defect', 
    templateUrl: 'client/defect/defect.html',
    providers: ['lookupTables'],
    
    // Or you can add the `stateConfig` directly to the component and avoid
    // importing the State decorator alltogether.
    stateConfig: {name: 'defect', url: '/defect', defaultRoute: '/defect'}
})
class Defect { 
}
```

#### `otherwise` previously known as `defaultRoute`

Examples of how to use `otherwise` and it's deprecated alias `defaultRoute`.

```javascript
{ name: 'root',               url: '' }
{ name: 'root.defect',        url: '/defect', otherwise: '/defect' }
{ name: 'root.defect.report', url: '/report', otherwise: '/defect/report' }
// `otherwise: true` is a shortcut for `otherwise: '/defect'`
{ name: 'root.defect',        url: '/defect', otherwise: true }
```

The `otherwise`property makes the annotated state the default for your app. That is, if the user types an unrecognised path into the address bar, or does not type any path other than the url of your app, they will be redirected to the path specified in `otherwise`. It is a bit like the old 404 not found redirect, except that in single page apps there is no 404. There is just the default page (or route). 

> Meteor's web server automatically redirects all unrecognised routes to the app root "/". However, if you're not using Meteor, you'll want to make sure that all unrecognised routes are redirected to the app root, which in many cases is "/", or to wherever they should go by design. 

> `defaultRoute` is deprecated. You should use `otherwise` in all cases

For example

```javascript
{ name: 'root.defect', url: '/defect', otherwise: '/defect' }
```

For nested states, such as shown above ("root.defect"), where the app default state has one or more parent states with their own URLs, always specify `otherwise` as a string that represents the final URL that you want the app to navigate to by default, as shown above.


#### Resolving Values

A `ui-router` resolve block can be added to the @State annotation, as shown below. UI router 1.x will inject resolved values directly into the controller (the Component's class instance), where they will be accessible as properties on `this`.  

```javascript
@State({
    name: 'defect', 
    url: '/defect', 
    otherwise: true,
    resolve: {
        user: ['$q', function($q) { return 'paul'; }],
        role: function() { return 'admin'; }
    }
})

@Component({ 
    selector: 'defect',
    templateUrl: 'client/defect/defect.html'
})

class Defect {
    constructor() { 
        // this.name == 'paul'
        // this.role == 'admin'
    }
}
```

#### States without a component
    
It is also possible to define a state without a component, by decorating a plain class with @State. 

> Note that then annotating plain classes (not Components) you will still have to add a `<ui-view></ui-view>` at the appropriate place in your HTML, otherwise nothing will seem to happen.

```javascript
@State({ 
    name: 'test', 
    url: '/test', 
    resolve: { 
        user: function() { return 'paul'; },
        role: function() { return 'admin'; } 
    } 
})
class App {
    constructor(user, role) {
        console.log('App resolved values: ', user, role);
    }
}
```

In this case, the class constructor is the controller for the route and receives the injected properties as arguments to its constructor (as per ui-router documentation).  


### Bootstrapping the app

This allows you to bootstrap your Angular 1 app using the (now deprecated) Angular 2 component bootstrap syntax. There is no need to use `ng-app`, but you can still use it if you want to. 

> Please read the in-source documentation for @State to see how to handle "abstract" routes on the bootstrap component.  

```javascript
bootstrap (App [, config ])
``` 

Using `bootstrap` is the equivalent of the Angular 1 manual bootstrapping method: `angular.bootstrap(DOMelement, ['app'])`. The bootstrap function also knows how to handle Cordova apps.
`config` is the same parameter as in [angular.bootstrap()](https://code.angularjs.org/1.3.15/docs/api/ng/function/angular.bootstrap). It can be used to enforce strictDi, for testing before deployment to production. 

#### An example showing how to bootstrap an app

In your HTML body add this:

```html
<my-app></my-app>
```

And in your JavaScript add the code below.  

```javascript
SetModule('my-app', []);

@Component({selector: 'my-app' })
@View({template: `<h1>Hello World</h1>`})
class App { 
}

bootstrap(App);
```

> By convention, the bootstrap module MUST have the same name as the bootstrap component's selector. So, as shown above, the bootstrap component's selector is "my-app" and the module name is also "my-app".

### ControllerAs `vm`

The created components use `ControllerAs` syntax. So, when referring to properties or methods on the component's class, make sure to prefix them with `this`. In the templates prefix all references to class variables and methods with `vm`. If the component's selector is `home-page` then your html might look like this:

```html
<div ng-click="vm.test()"></div>
```

#### Can I use a prefix other than `vm`?

Sure. See the options section, below, for how to change the global prefix from `vm` to whatever you want it to be. You can also specify controllerAs in your component definition, as shown below:

```javascript
@Component({ selector: 'defect', controllerAs: '$ctrl' })
class Defect { 
    test() {}
}
```

and then in your HTML template you will then be able do this:

```html
<div ng-click="$ctrl.test()"></div>
```

### ng2now `options`

Below is the list of ng2now options that can be changed. Make sure to set options before executing any other ang2now code.

Attribute | Type | Description
----------|------|-------------------
controllerAs | string | Allows you to specify a default controllerAs prefix to use for all components. The default prefix is the camel-cased version of the component's selector.   
uiRouterTemplate | string | The default "<div ui-view></div>" template can be overridden with `options.uiRouterTemplate`. This is useful when the `ui-view` should be rendered in an element other than a DIV, such as a SPAN.    

Options can be defined or changed like this:

```javascript
import {options, SetModule} from 'angular2now';

options({
    controllerAs: 'vm',
    uiRouterTemplate: '<div ui-view></div>'
})

// Now you can call SetModule(), etc...
SetModule(...)
```

## What environment is required?
- Angular 1.5+
- angular-ui-router 1+  (versions lower than 1.x will NOT work with ng2now)
- Babel 5.1.10+ or TypeScript 2+

### Browsers
- IE10+
- Chrome
- FireFox
- Safari desktop and mobile (IOS 7 or better)

## Why ng2now? 

Three simple reasons

1. make Angular 1 coding simple and fun for myself and my team
2. make me think of web apps in terms of components within components, instead of HTML + controllers + directives + ui-router 
3. make ui-router configuration simple (because it is not) 

As it stands now, the above three requirements are satisfied for myself, but if you would like to contribute then I am happy to consider a PR.

## You want to contribute?

If you think you have a great feature that should be incorporated in the main library, or a fix for a bug, or some doco updates then please send me a PR.

When sending code changes or new code make sure to describe in details what it is that you are trying to achieve and what the code does. I am not going to accept pure code without detailed descriptions of what it does and why.

### Contributors

This is a new repo, based on angular2-now, but re-written to work better with Angular 1.5. 

- Paul Bastowski (pbastowski)
