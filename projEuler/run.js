"use strict";

var range = require("../index")

range
    .interval(1, 21)
    .filter(function(i) {
        return (
            !process.browser ||
            (
                i !== 13 &&
                i !== 16 &&
                i !== 20
            )
        )
    })
    .map(function(i) {
        return {
            index: i,
            fn: require(
                (process.browser ? "/projEuler/problems/" : "") +
                "p" + i + ".js")
        }
    })
    .map(function(x) {
        // Time each solution
        var start = new Date()
        var value = x.fn()
        var end = new Date()

        return {
            value: value,
            time: end - start,
            index: x.index
        }
    })
    .map(function(problem) {
        return problem.index + ": " + problem.value + " (" + problem.time + "ms)"
    })
    .log()