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
export default ng2now;

// Legacy support
window.angular2now = exports;