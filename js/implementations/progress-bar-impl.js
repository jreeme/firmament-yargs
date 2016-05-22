"use strict";
var ProgressBarImpl = (function () {
    function ProgressBarImpl() {
        this.config = {
            width: 40,
            before: '[',
            after: ']',
            solid: { background: 'blue', foreground: 'white', text: '|' },
            empty: { background: null, foreground: null, text: ' ' }
        };
        this.progressBarMap = {};
        this.offset = 0;
    }
    ProgressBarImpl.prototype.showProgressForTask = function (id, status, current, total) {
        console.log('> ' + current.toLocaleString() + ' : ' + total.toLocaleString());
    };
    return ProgressBarImpl;
}());
exports.ProgressBarImpl = ProgressBarImpl;
//# sourceMappingURL=progress-bar-impl.js.map