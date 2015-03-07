"use strict";

var bigint = require("bigint")

var range = require("../../range.js")

module.exports = function p16() {
    // Find the sum of the digits of 2^1000.
    return range
        .fromString(
            bigint(2)
            .pow(1000)
            .toString())
        .map(parseInt)
        .sum()
}