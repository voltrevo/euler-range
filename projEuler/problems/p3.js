"use strict";

var range = require("../../index")

module.exports = function p3() {
    // Find the largest prime factor of 600851475143
    var n = 600851475143

    var p = range
        .primes()
        .while(function(p) { return p * p < n })
        .filter(function(p) { return n % p === 0 })
        .do(function(p) {
            do {
                n /= p
            } while (n % p === 0)
        })
        .last()

    p = Math.max(p, n)

    return p
}