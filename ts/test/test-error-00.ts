function sleepError(milliseconds) {
  let start = new Date().getTime();
  for (let i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds) {
      break;
    }
  }
}
(function () {
  for (let i = 0; i < 4; ++i) {
    sleepError(500);
    if(i == 2){
      process.exit(3);
    }
    process.stdout.write(`test me: ${i}\n`);
  }
})();
