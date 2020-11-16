function prepareRegex(re = "") {
  if (typeof re === "string") return new RegExp("^" + re);
  else if (re instanceof Object) return new RegExp("^" + re.source);
}

function BlueText(name, options) {
  this.escape = options.escape ? prepareRegex(options.escape) : false;
  this.alter = options.alter || ((res) => res);
  this.name = name;
  this.rules = (options.rules || []).map((v) => (v === BlueText.SELF ? this : v));
  if (options.pattern !== undefined) {
    this.pattern = prepareRegex(options.pattern || "");
    this.match = this.matchSimple;
  } else {
    this.start = prepareRegex(options.start || "");
    this.end = prepareRegex(options.end || "$");
    this.match = this.matchContainer;
  }
}

BlueText.SELF = Symbol("Rule.SELF");
BlueText.NONE = Symbol("Rule.NONE");

BlueText.prototype.matchSimple = function (str, c = { i: 0 }) {
  let res = {
    name: this.name,
    from: c.i,
  };
  let sub = str.slice(c.i);
  let match = sub.match(this.pattern);
  if (!match) return BlueText.NONE;
  res.captured = match.slice(1, match.length);
  c.i += match[0].length;
  res.to = c.i;
  res.match = str.slice(res.from, res.to);
  return this.alter(res);
};

BlueText.prototype.matchContainer = function (str, c = { i: 0 }) {
  let res = {
    name: this.name,
    inner: [],
    from: c.i,
    to: str.length,
    captured: [],
  };
  let sub = str.slice(c.i);
  let match = sub.match(this.start);
  if (!match) return BlueText.NONE;
  res.captured = match.slice(1, match.length);
  c.i += match[0].length;
  res.ifrom = c.i;
  while (str[c.i]) {
    let reject = true;
    for (let rule of this.rules) {
      let ruleRes = rule.match(str, c);
      if (ruleRes !== BlueText.NONE) {
        reject = false;
        res.inner.push(ruleRes);
      }
    }
    let sub = str.slice(c.i);
    if (this.escape) {
      let match = sub.match(this.escape);
      if (match) {
        c.i += match[0].length + 1;
        continue;
      }
    }
    let match = sub.match(this.end);
    if (match) {
      res.captured.push(...match.slice(1, match.length));
      res.ito = c.i;
      res.imatch = str.slice(res.ifrom, res.ito);
      c.i += match[0].length;
      res.to = c.i;
      res.match = str.slice(res.from, res.to);
      return this.alter(res);
    }
    if (reject) c.i++;
  }
  return this.alter(res);
};

module.exports = BlueText;
