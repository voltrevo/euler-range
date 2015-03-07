"use strict";

var range = require("../../index")

module.exports = function p6() {
    // Find the difference between the square of the sum of 1 to 100 and the sum of squares from 1 to 100.
    function sqr(x) { return x * x }
    return sqr(range.interval(1, 101).sum()) - range.interval(1, 101).map(sqr).sum()
}