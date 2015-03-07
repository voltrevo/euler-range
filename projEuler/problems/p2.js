"use strict";

var range = require("../../index")

module.exports = function p2() {
    // Sum the even fibonacci numbers under 4000000.
    return range
        .fromGenerator(function(){
            var state = [1, 0]

            return function() {
                var tmp = state[1]
                state[1] += state[0]
                state[0] = tmp

                return state[1]
            }
        }())
        .while(function(x) { return x <= 4000000 })
        .filter(function(x) { return x % 2 === 0 })
        .sum()
}