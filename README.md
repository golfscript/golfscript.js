# GolfScript.js

This is a full JavaScript interpreter for GolfScript.

GolfScript is a stack based language developed by Darren Smith. You can read about it at <http://www.golfscript.com>

This implementation uses standard JavaScript objects on the stack, rather than custom classes or monkey patching the prototypes.

So the GolfScript integer is represented by the JavaScript Number (or BigInt, if too large), array by Array, string by String, and block by Function.

One main difference to the original GolfScript interpreter is that this version is based on Unicode for strings, rather than UTF-8 (e.g. 😀 is a treated as a single character).

If you want, you can pass your own JavaScript functions to the interpreter, and use them in your GolfScript. The interpreter will automatically pop the correct number of arguments off the stack to pass to your function, and push the result back on the stack (if it is not null or undefined).

The syntax for calling GolfScript interpreter is as follows:

GolfScript(code,stack=[],blocks={},output='')

*code*: GolfScript program string

*stack*: optionally specify the existing array to use

*blocks*: optionally specify your own functions or variables (e.g. {alert:x=>alert(x), log:x=>console.log(x)})

*output*: optionally specify the starting string to use for output

*return value*: the output string
