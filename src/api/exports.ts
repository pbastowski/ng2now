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

window.ng2now = ng2now;

// Legacy support for angular2-now users
window.angular2now = ng2now;
