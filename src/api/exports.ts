var ng2now = {
    options,
    SetModule,
    Component,
    Directive,
    Inject,
    Injectable,
    Pipe,
    State,
    bootstrap,

    Service: Injectable,
    Filter: Pipe,
    RouterConfig: State
};


if (!exports) exports = {};
export default ng2now;

// Legacy support
window.angular2now = ng2now;