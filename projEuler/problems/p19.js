"use strict";

var range = require("../../index")
var args = range.util.args

module.exports = function p19() {
    // How many Sundays fell on the first day of the month during the 20th century?
    return range
        .cross(
            range.interval(1901, 2001),
            range.interval(1, 13))
        .filter(args(function(year, month) {
            return (new Date(year, month, 1)).getDay() === 0
        }))
        .length()
}