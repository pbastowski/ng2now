const ng2now = {
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

exports["def"+"ault"] = ng2now;

window.ng2now = ng2now;
