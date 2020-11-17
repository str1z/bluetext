function parseRE(re) {
  if (re instanceof RegExp) return new RegExp("^" + re.source, "s");
  else if (typeof re === "string") return new RegExp("^" + re, "s");
}
function Rule(options) {
  const { start, end, nested = [], chained = [], map = (res) => res } = options;
  this.start = parseRE(start);
  this.end = parseRE(end);
  this.nested = nested.map((v) => (v === Rule.SELF ? this : v));
  this.chained = chained.map((v) => (v === Rule.SELF ? this : v));
  this.map = map;
}
Rule.prototype.chain = function (...rules) {
  this.chained.push(...rules.map((v) => (v === Rule.SELF ? this : v)));
  return this;
};
Rule.prototype.nest = function (...rules) {
  this.nested.push(...rules.map((v) => (v === Rule.SELF ? this : v)));
  return this;
};
Rule.prototype.repeat = function () {
  this.chained.unshift(this);
  return this;
};
Rule.prototype.recurse = function () {
  this.nested.unshift(this);
  return this;
};
Rule.NONE = Symbol("Rule.NONE");
Rule.SELF = Symbol("Rule.SELF");
Rule.prototype.parse = function (s, c = { i: 0 }) {
  let start = s.slice(c.i).match(this.start);
  if (!start) return Rule.NONE;
  let i0 = c.i,
    i1 = (c.i += start[0].length),
    i2,
    i3,
    end,
    nested = [],
    chained;
  if (this.end)
    while (s[c.i]) {
      if ((end = s.slice(c.i).match(this.end))) {
        i2 = c.i;
        i3 = c.i += end[0].length;
        break;
      }
      for (let rule of this.nested) {
        let res = rule.parse(s, c);
        if (res !== Rule.NONE) {
          nested.push(res);
          break;
        }
      }
    }
  for (let rule of this.chained) {
    let res = rule.parse(s, c);
    if (res !== Rule.NONE) {
      chained = res;
      break;
    }
  }
  return this.map({ i: [i0, i1, i2, i3], start, end, nested, chained });
};

if (typeof module !== "undefined") module.exports = Rule;
