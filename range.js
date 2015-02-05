"use strict";

var range = {}

;(function(){

function instance(next, hasNext) {
    this.next = next
    this.hasNext = hasNext
}

instance.prototype.each = function(f) {
    while (this.hasNext())
        f(this.next())
}

instance.prototype.filter = function(f) {
    var self = this

    if (!self.hasNext())
        return range.empty()

    var next = self.next()

    while (!f(next)) {
        if (!self.hasNext())
            return range.empty()

        next = self.next()
    }

    var hasNext = true

    return new instance(
        function() {
            if (!hasNext)
                return null

            var oldNext = next

            while (true) {
                if (!self.hasNext()) {
                    hasNext = false
                    break
                }

                next = self.next()

                if (f(next)) {
                    break
                }
            }

            return oldNext
        },
        function() { return hasNext }
    )
}

instance.prototype.transform = function(f) {
    var self = this

    return new instance(
        function() { return f(self.next()) },
        function() { return self.hasNext() }
    )
}

instance.prototype.while = function(cond) {
    var self = this

    if (!self.hasNext())
        return range.empty()

    var next = self.next()
    var hasNext = cond(next)

    return new instance(
        function() {
            var oldNext = next

            if (self.hasNext()) {
                next = self.next()
                hasNext = cond(next)
            } else {
                hasNext = false
            }

            return oldNext
        },
        function() { return hasNext }
    )
}

instance.prototype.fold = function(x, f) {
    this.each(function(element) {
        x = f(x, element)
    })
    return x
}

instance.prototype.sum = function() { return this.fold(0, function(x, y) { return x + y }) }
instance.prototype.product = function() { return this.fold(1, function(x, y) { return x * y }) }

instance.prototype.count = function() {
    var c = 0
    this.each(function() { c++ })
    return c
}

instance.prototype.concat = function(rhs) {
    var curr = this

    return new instance(
        function() {
            if (!curr.hasNext())
                curr = rhs

            return curr.next()
        },
        function() {
            return curr.hasNext() || rhs.hasNext()
        }
    )
}

range.empty = function() {
    return new instance(
        function() { return null },
        function() { return false }
    )
}

range.interval = function(a, b) {
    return new instance(
        function() { return a++ },
        function() { return a < b }
    )
}

range.fromArray = function(arr) {
    var i = 0

    return new instance(
        function() { return arr[i++] },
        function() { return i < arr.length - 1 }
    )
}

range.fromString = function(str) {
    var i = 0

    return new instance(
        function() { return str[i++] },
        function() { return i < str.length - 1 }
    )
}

range.fromGenerator = function(f) {
    return new instance(f, function() { return true })
}

range.test = function() {
    ;(function basicInterval() {

        /*range.interval(0, 10).each(function(x) {
            console.log(x)
        })*/

        range
            .fromGenerator(function() {
                var i = 0
                return function() { return i++ }
            }())
            .while(function(x) { return x <= 13 })
            .each(function(x) {
                console.log(x)
            })

    }())

    ;(function projEuler1() {

        console.log(
            range
                .interval(1, 1000)
                .filter(function(x) { return x % 3 === 0 || x % 5 === 0 })
                .sum())

    }())
}

if (!module)
    module = {}

module.exports = range

}())