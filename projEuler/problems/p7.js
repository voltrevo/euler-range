"use strict";

var range = require("../../index")

module.exports = function p7() {
    // Find the 10,001st prime.
    return range.primes().head(10001).last()
}