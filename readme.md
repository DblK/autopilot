# Autopilot (CICP Plugin)

This CICP plugin allows you to dynamically change the configuration of the any other plugins by sending query to any domain with some specific headers.  

You first neeed to use `registerCommand`, then you listen for a specific event with the command you just registered.

# How to use it

## Add it to CICP

Install it to your `plugins` folder, then do not forget to add it while launching the cli: `cicp -o autopilot,othersPlugins...`.   
For a better usage, this plugin should be the first one in the list.

## Require this plugin from another

Simply add the following object in your `package.json`:

```json
"plugin": {
  "consumes": [
    "autopilot",
  ],
}
```

## Register an event
```js
this.autopilot.registerCommand({
    command: 'NEW-COMMAND',
    bypassQuery: true,
    waitForContinue: true,
});
```

__Arguments__

* object:
  * command (String) - Name of the new command
  * bypassQuery (Boolean) - If `true`, autopilot will response to client with 204 status. Default `false`.
  * waitForContinue (Boolean) - If `true` autopilot will not pass to the next plugin (you must call it yourself). Default `false`.

## Wait for event

Later in your code use something like:

```js
this.autopilot.on('NEW-COMMAND', (params) => {
    console.log(params);
});
```

__Description of params__

Params is an object having the following properties:
* command (String) - Name of the command responsible for the event (Same as the event)
* value (String) - Value of the specific header
* req - The initial request object (https://nodejs.org/api/http.html#http_class_http_clientrequest)
* res - The response to the client (https://nodejs.org/api/http.html#http_class_http_serverresponse)
* next - Call the next middleware (Pass an object to set the error)

## Trigger the event

Simply make a request to any domain with the following header `X-DBLK-CICP-NEW-COMMAND'

# Additional Informations

This module use `DEBUG` so feel free to add `DEBUG=cicp:autopilot` to see debug logs.

# License

```
Copyright (c) 2019 Rémy Boulanouar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:



The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.



THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```