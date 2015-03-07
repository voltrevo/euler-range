"use strict";

var range = require("../../index")

module.exports = function p17() {
    // Find the number of letters in "one, two, three, ... one thousand" without commas or spaces.
    function numWords(n) {
        var digits = [
            "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
            "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"
        ]

        var tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"]

        function under100(n) {
            if (n < 20) {
                return digits[n]
            }

            var digit = n % 10
            return tens[(n - digit) / 10] + (digit === 0 ? "" : " " + digits[digit])
        }

        if (n >= 1000)
            return "one thousand"

        var under100Digits = n % 100
        var hundreds = (n - under100Digits) / 100

        if (n < 100)
            return under100(n)

        if (under100Digits === 0)
            return digits[hundreds] + " hundred"

        return digits[hundreds] + " hundred and " + under100(under100Digits)
    }

    return range
        .interval(1, 1001)
        .map(numWords)
        .map(function(s) { return s.replace(/ /g, "").length })
        .sum()
}