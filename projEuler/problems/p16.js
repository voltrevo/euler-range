"use strict";

var bigint = require("bigint")

var range = require("../../index")

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