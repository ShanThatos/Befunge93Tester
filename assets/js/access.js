var _w;
var continueStep;

$(document).ready(function() {
  function getStepCount() {
    var sC = $("#stepCountInput").val();
    console.log(sC);
    if (sC.trim() == "") return 1;
    else return Math.max(1, Math.max(100, parseInt(sC)));
  }

  $("#runBtn").click(function() {
    if (_w != undefined) _w.terminate();
    _w = undefined;
    _w = new Worker("assets/js/befunge93.js");
    _w.addEventListener(
      "message",
      function(e) {
        switch (e.data.cmd) {
          case "userInput":
            var inp = prompt(e.data.msg);
            if (inp == undefined) {
              _w.terminate();
              _w = undefined;
            } else {
              _w.postMessage({ cmd: "userInput", userInput: inp });
            }
            break;
          case "output":
            $("#outputTxt").html("Output: \n" + e.data.msg);
            $("#outputTxt").scrollTop($("#outputTxt")[0].scrollHeight);
            break;
        }
      },
      false
    );
    _w.postMessage({
      cmd: "start",
      code: $("#codeInput").val(),
      time: 1,
      stepCount: getStepCount()
    });
  });
  $("#stopBtn").click(function() {
    if (_w != undefined) _w.terminate();
    _w = undefined;
  });
  $("#stepCountInput").change(function() {
    if (_w != undefined)
      _w.postMessage({ cmd: "stepCountChange", stepCount: getStepCount() });
  });
});
