"use strict";
var multimeter = require('pm2-multimeter');
var multi = multimeter(process);
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
        var bar = this.progressBarMap[id];
        if (!bar) {
            multi.offset++;
            this.progressBarMap[id] = bar = multi.rel(1, this.offset++, this.config);
            console.log('>');
        }
        status = ' ** ' + id + ': ' + status + '                    ';
        bar.ratio(current, total, status);
    };
    return ProgressBarImpl;
}());
exports.ProgressBarImpl = ProgressBarImpl;
//# sourceMappingURL=progress-bar-impl.js.map