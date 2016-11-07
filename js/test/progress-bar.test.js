"use strict";
require('reflect-metadata');
const inversify_config_1 = require('../inversify.config');
const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;
describe('ProgressBar', function () {
    let progressBar;
    beforeEach(() => {
        progressBar = inversify_config_1.default.get('ProgressBar');
    });
    describe('create using kernel', () => {
        it('should be created by kernel', function (done) {
            expect(progressBar).to.not.equal(null);
            done();
        });
    });
    describe('should call console.log', () => {
        let consoleLogSpy;
        before(() => {
            consoleLogSpy = sinon.spy(console, 'log');
        });
        it('console.log() was called', function (done) {
            progressBar.showProgressForTask('id', 'status', 50, 100);
            expect(consoleLogSpy.called).to.equal(true);
            done();
        });
        after(() => {
            console.log.restore();
        });
    });
    describe('should call console.log with "> 50 : 100"', () => {
        let consoleLogStub;
        before(() => {
            consoleLogStub = sinon.stub(console, 'log', (msg) => {
                expect(msg).to.equal('> 50 : 100');
            });
        });
        it('console.log() was called', function (done) {
            progressBar.showProgressForTask('id', 'status', 50, 100);
            expect(consoleLogStub.called).to.equal(true);
            done();
        });
        after(() => {
            console.log.restore();
        });
    });
});
//# sourceMappingURL=progress-bar.test.js.map