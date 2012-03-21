# Backbone localStorage Adapter v1.1

A localStorage adapter for Backbone.

## Usage

Include Backbone.localStorage after having included Backbone.js:

```html
<script type="text/javascript" src="backbone.js"></script>
<script type="text/javascript" src="backbone.localStorage.js"></script>
```

Locally stored collections:

```javascript
var SomeCollection = Backbone.Collection.extend({

  // This collection will be stored as the array 'SomeCollection' in LocalStorage
  // Its individual models will be stored as 'SomeCollection-someid'
  localStorage: new Backbone.LocalStorage("SomeCollection"),

  // ... everything else is normal
});
```

Locally stored models:

```javascript
var SomeModel = Backbone.Model.extend({

  // This model will be stored as 'SomeModel-someid' in LocalStorage
  // A LocalStorage reference to it will be included in an array in 'SomeModel'
  localStorage : new Backbone.LocalStorage('SomeModel')

  // ... everything else is normal
});
```

Locally stored singletons:

```javascript
var SomeSingleton = Backbone.Model.extend({
  
  // This singleton model will always be stored as 'SomeSingleton' in LocalStorage
  // No reference array will be stored
  localStorage : new Backbone.LocalStorage('SomeModel', true)

  // ... everything else is normal
});
```

## Credits

  -  Thanks to [Hunter Loftis](https://github.com/hunterloftis) for singleton support and tests.
  - Thanks to [Mark Woodall](https://github.com/llad) for the QUnit tests.
  - Thanks to [Martin Häcker](https://github.com/dwt) for the many fixes and the test isolation.

## Licensed

Licensed under MIT license

Copyright (c) 2010 Jerome Gravel-Niquet

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.