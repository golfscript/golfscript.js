# GolfScript.js

## A full JavaScript interpreter for GolfScript

GolfScript is a stack based language developed by Darren Smith. You can read about it at <http://www.golfscript.com>

Download the code at <https://github.com/golfscript/golfscript.js>

This implementation uses standard JavaScript objects on the stack, rather than custom classes or monkey patching the prototypes. So a GolfScript integer is represented by a JavaScript Number (or BigInt, if too large), an array by Array, a string by String, and a block by a Function.

One main difference to the original GolfScript interpreter is that this version is based on Unicode for strings, rather than UTF-8 (e.g. 😀 is a treated as a single character).

If you want, you can pass your own JavaScript functions to the interpreter, and use them in your GolfScript. The interpreter will automatically pop the correct number of arguments off the stack to pass to your function, and push the result back on the stack (if it is not null or undefined).

You can test some GolfScript in your browser below

<script src="golfscript.js"></script>
<script>const get = id => document.getElementById(id)</script>

<textarea id="code" cols="80" rows="20" placeholder="code"># Greatest common divisor
'2706 410'
~{.@\%.}do;</textarea>
<button onclick="get('output').innerText=GolfScript(get('code').value)">Go</button>
<pre id="output"></pre>
