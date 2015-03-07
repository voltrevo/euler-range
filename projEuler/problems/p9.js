"use strict";

var range = require("../../index")
var args = range.util.args

module.exports = function p9() {
    // Find the only pythagorean triad ([a, b, c] such that a * a + b * b = c * c) and a, b, c < 1000.
    return range
        .cross(
            range.interval(1, 1000),
            range.interval(1, 1000)) // TODO: orderedSelfCross
        .map(args(function(a, b) {
            var c = 1000 - a - b
            return [a, b, c]
        }))
        .filter(args(function(a, b, c) {
            return a * a + b * b === c * c
        }))
        .map(args(function(a, b, c) { return a * b * c }))
        .first()
}