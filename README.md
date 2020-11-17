# bluetext

Blueprints for text! Parses text to a tree according to your rules.

## Installation

### Browser

```html
<script src="https://cdn.jsdelivr.net/npm/bluetext"></script>
```

### Node

```sh
npm install bluetext
```

```js
const BlueText = require("bluetext");
```

## Usage

```js
let strings = new BlueText("strings", {
  escape: "\\", // escape character
  start: '"',
  end: '"',
  alter: (res) => res.match,
});

let comments = new BlueText("comments", {
  start: "/\\*",
  end: "\\*/",
  alter: () => BlueText.NONE, // do not add to parent inner.
});

let brackets = new BlueText("brackets", {
  start: "[", // or just use JS regex
  end: "]", // this will get compiled to regex
  alter: (res) => res.match, // alter the result
  rules: [BlueText.SELF, strings, comments],
});

let res = brackets.match('[["Hello"]]');
console.log(res);
```
