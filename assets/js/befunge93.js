var code;
var cR, cC, cD, cWidth, cHeight;
var st;
var stringMode, reachedEnd, waitingForInput;
var output;
var dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
var userInput;

self.addEventListener(
  "message",
  function(e) {
    switch (e.data.cmd) {
      case "start":
        start(e.data.code);
        setInterval(function() {
          if (!waitingForInput) step(1);
        }, e.data.time);
        break;
      case "userInput":
        userInput = e.data.userInput;
        waitingForInput = false;
        break;
    }
  },
  false
);

function getOutput() {
  return output;
}

function start(str) {
  parseCode(str);
  cR = 0;
  cC = 0;
  cD = 0;
  st = [];
  stringMode = false;
  reachedEnd = false;
  waitingForInput = false;
  output = "";
  userInput = undefined;
}

function parseCode(str) {
  var maxWidth = 0;
  var allLines = str.split("\n");
  for (var i = 0; i < allLines.length; i++) {
    allLines[i] = allLines[i].trimEnd();
    maxWidth = Math.max(allLines[i].length, maxWidth);
  }
  cWidth = maxWidth;
  cHeight = allLines.length;
  code = new Array(allLines.length);
  for (var i = 0; i < allLines.length; i++) {
    code[i] = allLines[i].split("");
    while (code[i].length < maxWidth) code[i].push(" ");
  }
}

function step(stepCount) {
  if (reachedEnd) return;
  for (var i = 0; i < stepCount && !reachedEnd && !waitingForInput; i++) {
    decode(code[cR][cC]);
    if (!waitingForInput) move();
  }
  //console.log(cR + " " + cC + " " + code[cR][cC]);
  //console.log("Stack: " + st);
  //console.log("Output: " + output);
  self.postMessage({ cmd: "output", msg: output });
}

function move() {
  cR += dirs[cD][0];
  cC += dirs[cD][1];
  cR = (cR + cHeight) % cHeight;
  cC = (cC + cWidth) % cWidth;
}

function decode(k) {
  if (k == '"') {
    stringMode = !stringMode;
    return;
  } else if (stringMode) {
    st.push(k.charCodeAt(0));
    return;
  }
  switch (k) {
    case "+":
      var a = pop(),
        b = pop();
      st.push(b + a);
      break;
    case "-":
      var a = pop(),
        b = pop();
      st.push(b - a);
      break;
    case "*":
      var a = pop(),
        b = pop();
      st.push(b * a);
      break;
    case "/":
      var a = pop(),
        b = pop();
      st.push(Math.trunc(b / a));
      break;
    case "%":
      var a = pop(),
        b = pop();
      st.push(b % a);
      break;
    case "!":
      var a = pop();
      st.push(a == 0 ? 1 : 0);
      break;
    case "`":
      var a = pop(),
        b = pop();
      st.push(b > a ? 1 : 0);
      break;
    case ">":
      cD = 0;
      break;
    case "<":
      cD = 2;
      break;
    case "^":
      cD = 3;
      break;
    case "v":
      cD = 1;
      break;
    case "?":
      cD = Math.floor(Math.random() * 4);
      break;
    case "_":
      var a = pop();
      cD = a == 0 ? 0 : 2;
      break;
    case "|":
      var a = pop();
      cD = a == 0 ? 1 : 3;
      break;
    case ":":
      var a = pop();
      st.push(a);
      st.push(a);
      break;
    case "\\":
      var a = pop(),
        b = pop();
      st.push(a);
      st.push(b);
      break;
    case "$":
      pop();
      break;
    case ".":
      var a = pop();
      output += a;
      break;
    case ",":
      var a = pop();
      output += String.fromCharCode(a);
      break;
    case "#":
      move();
      break;
    case "g":
      var y = pop(),
        x = pop();
      try {
        st.push(code[y][x].charCodeAt(0));
      } catch (err) {
        st.push(0);
      }
      break;
    case "p":
      var y = pop(),
        x = pop(),
        v = pop();
      code[y][x] = String.fromCharCode(v);
      break;
    case "&":
      if (userInput == undefined && !waitingForInput) {
        self.postMessage({ cmd: "output", msg: output });
        for (var i = 0; i < 10000; i++) {}
        self.postMessage({ cmd: "userInput", msg: "Enter a Number: " });
        waitingForInput = true;
      } else if (userInput != undefined) {
        var num = parseInt(userInput);
        waitingForInput = false;
        userInput = undefined;
        st.push(num);
      }
      break;
    case "~":
      if (userInput == undefined && !waitingForInput) {
        self.postMessage({ cmd: "output", msg: output });
        for (var i = 0; i < 10000; i++) {}
        self.postMessage({ cmd: "userInput", msg: "Enter a Character: " });
        waitingForInput = true;
      } else if (userInput != undefined) {
        var ch = userInput;
        userInput = undefined;
        st.push(ch);
      }
      break;
    case "@":
      reachedEnd = true;
      break;
    default:
      if (/^\d+$/.test(k)) st.push(parseInt(k));
      else if (k.match(/[a-z]/i)) st.push(parseInt(k.charCodeAt(0)));
      break;
  }
}

function pop() {
  if (st.length == 0) return 0;
  return st.pop();
}

//start("<@$_,#! #:<\"Hello World!\"0");
