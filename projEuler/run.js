"use strict";

var range = require("../index")

range
    .interval(1, 21)
    .map(function(n) { return require("./problems/p" + n + ".js") })
    .map(function(f) {
        // Time each solution
        var start = new Date()
        var value = f()
        var end = new Date()

        return {
            value: value,
            time: end - start
        }
    })
    .combine('index', range.numbers(1))
    .map(function(problem) {
        return problem.index + ": " + problem.value + " (" + problem.time + "ms)"
    })
    .log()