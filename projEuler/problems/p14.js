"use strict";

var range = require("../../index")

module.exports = function p14() {
    // Find the longest collatz sequence starting less than 1,000,000.
    
    function collatzLength(n) {
        var len = 0

        while (n !== 1) {
            if (n % 2 === 0) {
                n /= 2
                len += 1
            } else {
                n = (3 * n + 1) / 2
                len += 2
            }
        }

        return len
    }

    return range
        .interval(1, 1000000)
        .map(function(n) { return [n, collatzLength(n)] })
        .fold([1, 0], function(x, y) {
            return y[1] > x[1] ? y : x;
        })[0]
}