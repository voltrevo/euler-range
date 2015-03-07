"use strict";

var range = require("../../index")
var args = range.util.args

module.exports = function p12() {
    return range
        .fromGenerator(function() {
            var i = 0
            var sum = 0

            return function() {
                i++
                sum += i
                return sum
            }
        }())
        .map(function(n) {
            var count = 1
            var nn = n

            range
                .primes()
                .while(function(p) { return p * p <= nn })
                .each(function(p) {
                    var power = 0
                    while (nn % p === 0) {
                        power++
                        nn /= p
                    }
                    count *= 1 + power
                })

            if (nn !== 1) {
                count *= 2 // nn is now prime, so it can be present or not from each factor
            }

            return [n, count]
        })
        .filter(args(function(n, count) { return count > 500 }))
        .map(args(function(n/*, count*/) { return n }))
        .first()
}