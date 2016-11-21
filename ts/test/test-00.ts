function sleep(milliseconds) {
  let start = new Date().getTime();
  for (let i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds) {
      break;
    }
  }
}
(function () {
  for (let i = 0; i < 300; ++i) {
    sleep(500);
    process.stdout.write(`test me: ${i}\n`);
  }
})();
