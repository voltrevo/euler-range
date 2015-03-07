"use strict";

var range = require("../../index")

module.exports = function p1() {
    // Sum the numbers from 1 to 1000 which are divisible by 3 or 5.
    return range
        .interval(1, 1000)
        .filter(function(x) {
            return x % 3 === 0 || x % 5 === 0
        })
        .sum()
}