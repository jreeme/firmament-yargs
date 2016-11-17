function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds) {
      break;
    }
  }
}
(function () {
  for (var i = 0; i < 3; ++i) {
    sleep(500);
    console.log('hi: ' + i);
  }
})();
