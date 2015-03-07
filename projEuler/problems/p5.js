"use strict";

var range = require("../../index")

module.exports = function p5() {
    // Find the smallest number divisible by 1 to 20.
    function gcd(a, b) {
        while (b !== 0) {
            var tmp = b
            b = a % b
            a = tmp
        }

        return a
    }

    return range
        .interval(2, 21)
        .fold(1, function(x, y) {
            return x * (y / gcd(x, y))
        })
}