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

    Service,
    Filter,
    RouterConfig
};

// export default ng2now
// exports["def"+"ault"] = ng2now;

if (typeof window !== 'undefined')
    window.ng2now = ng2now
