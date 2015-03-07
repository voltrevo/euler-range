"use strict";

var range = require("../../index")
var args = range.util.args

module.exports = function p4() {
    // Find the largest product of two 3 digit numbers which is a palindrome.
    return range
        .cross(
            range.interval(100, 1000),
            range.interval(100, 1000))
        .map(args(function(x, y) { return x * y }))
        .filter(function(x) { return range.digits(x).isPalindrome() })
        .max()
}