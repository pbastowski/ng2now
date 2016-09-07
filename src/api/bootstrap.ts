/**
 * Bootstraps the Angular 1.x app.
 *
 * @param ?target   undefined | string | class
 *      undefined:  bootstraps on document and the current angular module
 *      string:     will use document.querySelector to find the element by this string
 *      class:      bootstraps on the component defined on this class, looks for selector
 *
 * @param ?config   angular.bootstrap() config object, see AngularJS doco
 */
export function bootstrap(target, config) {
    let bootOnDocument = false;

    // console.log('@Bootstrap: target: ', decorate(target).selector, decorate(target).moduleName)

    // Take care of bootstrapping on a class without a Component annotation
    if (!target || (target && !decorate(target).selector && typeof target === 'function')) {
        target         = decorate(target || {}, {selector: common.moduleName});
        bootOnDocument = true;
    }

    // Allow string shortcut for decorate(target).selector. Can be the name of any HTML tag.
    if (typeof target === 'string') {
        target = {
            selector: target
        };
    }

    // Mark this class as a bootstrap component. This allows @State
    // to handle it correctly.
    decorate(target, {bootstrap: true});

    const bootModule = decorate(target).selector || common.moduleName;

    // console.log('@Bootstrap: bootModule: ', bootModule, decorate(target).selector)

    if (bootModule !== common.moduleName) {
        common.angularModule(bootModule);
    }

    if (!config) {
        config = {
            strictDi: false
        };
    }

    common.isCordova = typeof cordova !== 'undefined';

    if (common.isCordova) {
        angular.element(document).on('deviceready', onReady);
    } else {
        angular.element(document).ready(onReady);
    }

    function onReady() {
        let el;

        if (!bootOnDocument) {
            // Find the component's element
            el = document.querySelector(decorate(target).selector);
        } else {
            // Or use document, if user passed no arguments
            el = document.body;
        }

        angular.bootstrap(el, [bootModule], config);
    }
}

