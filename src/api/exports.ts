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

// Node.js style
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ng2now;
    exports['def'+'ault'] = ng2now;
}
else if (typeof define !== 'undefined' && define.amd) {
    define('ng2now', [], function () {
        return ng2now;
    });
}
else if (typeof window !== 'undefined')
    window.ng2now = ng2now;