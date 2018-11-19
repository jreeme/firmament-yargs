import 'reflect-metadata';
import kernel from '../inversify.config';
import {ProgressBar} from '../interfaces/progress-bar';
import * as chai from 'chai';
import * as sinon from 'sinon';
const expect = chai.expect;
describe('ProgressBar', function () {
  let progressBar: ProgressBar;
  beforeEach(()=> {
    progressBar = kernel.get<ProgressBar>('ProgressBar');
  });
  describe('create using kernel', ()=> {
    it('should be created by kernel', function (done) {
      expect(progressBar).to.not.equal(null);
      done();
    });
  });
  describe('should call console.log', ()=> {
    let consoleLogSpy:any;
    before(()=> {
      consoleLogSpy = sinon.spy(console, 'log');
    });
    it('console.log() was called', function (done) {
      progressBar.showProgressForTask('id', 'status', 50, 100);
      expect(consoleLogSpy.called).to.equal(true);
      done();
    });
    after(()=> {
      (<any>console.log).restore();
    });
  });
  describe('should call console.log with "> 50 : 100"', ()=> {
    let consoleLogStub:any;
    before(()=> {
      /*      consoleLogStub = sinon.stub(console, 'log', (msg)=>{
              expect(msg).to.equal('> 50 : 100');
            });*/
    });
    it('console.log() was called', function (done) {
      progressBar.showProgressForTask('id', 'status', 50, 100);
      expect(consoleLogStub.called).to.equal(true);
      done();
    });
    after(()=> {
      (<any>console.log).restore();
    });
  });
});
