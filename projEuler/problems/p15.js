"use strict";

var range = require("../../index")

module.exports = function p15() {
    // Find the number of paths from the top-left to the bottom-right through a 20x20 grid only moving right or down.

    // Always takes 40 movements, 20 down and 20 right, but jumbled.
    // This amounts to choosing 20 places to put down movements among 40 slots, which is 40 C 20.

    function ncr(n, r) {
        return range.interval(r + 1, n + 1).product() / range.interval(1, r + 1).product()
    }

    return ncr(40, 20)
}