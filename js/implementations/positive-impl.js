"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
const inversify_1 = require('inversify');
const positive_1 = require("../interfaces/positive");
const positive = require('positive');
let PositiveImpl = class PositiveImpl {
    areYouSure(confirmMsg, cancelMsg, defaultAnswer = false, failureRetVal = positive_1.FailureRetVal.NOT_SET) {
        let retVal = true;
        try {
            retVal = positive(confirmMsg, defaultAnswer);
        }
        catch (err) {
            retVal = (failureRetVal !== positive_1.FailureRetVal.NOT_SET)
                ? failureRetVal === positive_1.FailureRetVal.TRUE
                : defaultAnswer;
        }
        if (!retVal) {
            console.error(cancelMsg);
        }
        return retVal;
    }
};
PositiveImpl = __decorate([
    inversify_1.injectable(), 
    __metadata('design:paramtypes', [])
], PositiveImpl);
exports.PositiveImpl = PositiveImpl;
//# sourceMappingURL=positive-impl.js.map