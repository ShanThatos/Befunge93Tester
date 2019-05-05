var _w;
var continueStep;

$(document).ready(function() {
  $("#runBtn").click(function() {
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
    _w.postMessage({ cmd: "start", code: $("#codeInput").val(), time: 1 });
  });
  $("#stopBtn").click(function() {
    _w.terminate();
    _w = undefined;
  });
});
