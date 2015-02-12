"use strict";

var range = {}

;(function(){

function instance(value, done, next) {
    // An instance of a range.

    this.value = value // current value
    this.done = done   // boolean indicating whether we are at the end of the range. If true, value and next are invalid and should not be accessed.
    this.next = next   // function to progress to the next element of the range
}

instance.prototype.do = function(f) {
    // Simply do something, ie call f, as values pass through. f is called as values come in (just after next).

    if (this.done)
        return

    var self = this
    
    f(self.value)

    var oldNext = self.next

    self.next = function() {
        oldNext()

        if (!self.done)
            f(self.value)
    }

    return self
}

instance.prototype.doLater = function(f) {
    // Simply do something, ie call f, as values pass through. f is called as values go out (just before next).

    var self = this
    var oldNext = self.next

    self.next = function() {
        f(self.value)
        oldNext()
    }

    return self
}

instance.prototype.each = function(f) {
    // Call f for each element of the range. This is different from do because it causes iteration and does not allow chaining.
    while (!this.done) {
        f(this.value)
        this.next()
    }
}

instance.prototype.eachWhile = function(f) {
    // Like each, but f returns true to keep going and false to stop.
    while (!this.done) {
        if (!f(this.value)) {
            return false
        }
        this.next()
    }

    return true
}

instance.prototype.filter = function(f) {
    // Remove all values for which f(x) is false.

    while (!this.done && !f(this.value))
        this.next()

    if (this.done)
        return this

    var self = this

    var ret = new instance(
        self.value,
        false,
        function() {
            do {
                self.next()
            } while (!self.done && !f(self.value))

            if (self.done) {
                ret.done = true
            } else {
                ret.value = self.value
                ret.done = false
            }
        }
    )

    return ret
}

instance.prototype.map = function(f) {
    // Replace value with f(value).

    if (this.done)
        return this

    var self = this

    var ret = new instance(
        f(self.value),
        self.done,
        function() {
            self.next()
            ret.done = self.done

            if (!self.done) {
                ret.value = f(self.value)
            }
        }
    )

    return ret
}

instance.prototype.window = function(size) {
    // Convert range to moving window so that multiple elements can be seen at once. For example, [1, 2, 3, 4] => [[1, 2], [2, 3], [3, 4]]

    var self = this

    var w = []
    for (var i = 0; i < size && !self.done; i++) {
        w.push(self.value)
        self.next()
    }

    if (w.length < size) {
        return self
    }

    var ret = new instance(
        w,
        false,
        function() {
            if (self.done) {
                ret.done = true
                return
            }

            w.shift()
            w.push(self.value)

            ret.value = w

            self.next()
        }
    )

    return ret
}

instance.prototype.while = function(cond) {
    // Set done to true when cond(value) is false.

    if (this.done)
        return this

    var self = this

    var ret = new instance(
        self.value,
        self.done || !cond(self.value),
        function() {
            self.next()
            ret.value = self.value
            ret.done = self.done || !cond(self.value)
        }
    )

    return ret
}

instance.prototype.fold = function(x, f) {
    // Collapse the range into a single value by providing a starting value and a function which takes two range elements and returns one.
    this.each(function(element) {
        x = f(x, element)
    })
    return x
}

// Convenience wrapper around fold to calculate a sum.
instance.prototype.sum = function() { return this.fold(0, function(x, y) { return x + y }) }

// Convenience wrapper around fold to calculate a product.
instance.prototype.product = function() { return this.fold(1, function(x, y) { return x * y }) }

instance.prototype.count = function() {
    // Count the elements in the range.
    var c = 0
    this.each(function() { c++ })
    return c
}

// Convenience wrapper around fold to calculate the minimum.
instance.prototype.min = function() { return this.fold(Infinity, Math.min) }

// Convenience wrapper around fold to calculate the maximum.
instance.prototype.max = function() { return this.fold(-Infinity, Math.max) }

// Concatenate rhs onto the end of the range.
instance.prototype.concat = function(rhs) {
    if (this.done)
        return rhs

    if (rhs.done)
        return this

    var curr = this

    var ret = new instance(
        curr.value,
        false,
        function() {
            curr.next()

            if (curr.done)
                curr = rhs

            ret.value = curr.value
            ret.done = curr.done
        }
    )

    return ret
}

// Convert a range to an array.
instance.prototype.toArray = function() {
    var arr = []
    this.each(function(x) { arr.push(x) })
    return arr
}

// Is range palindromic.
instance.prototype.isPalindrome = function() {
    var arr = this.toArray()

    var left = 0
    var right = arr.length - 1

    while (left < right) {
        if (arr[left] !== arr[right])
            return false

        left++
        right--
    }

    return true
}

// Return a range with only the first n elements of the current range.
instance.prototype.head = function(n) {
    var self = this

    var ret = new instance(
        self.value,
        n === 0,
        function() {
            self.next()

            if (self.done) {
                ret.done = true
                return
            }

            n--
            ret.value = self.value
            ret.done = n <= 0
        }
    )

    return ret
}

// Return a range with only the last n elements of the current range.
instance.prototype.tail = function(n) {
    return this.window(n).last()
}

// Return the first element of the range.
instance.prototype.first = function() { return this.value }


instance.prototype.last = function() {
    // Return the last element of the range.
    var last

    while (!this.done) {
        last = this.value
        this.next()
    }

    return last
}

instance.prototype.length = function() {
    // Count the elements in the range.
    var c = 0
    this.each(function() { c++ })
    return c
}

instance.prototype.flatten = function() {
    // Concatenate an array of arrays. E.g. [[5], [], [6, 7, 8]] => [5, 6, 7, 8]
    var self = this
    var i = 0

    while (!self.done && self.value.length === 0)
        self.next()

    if (self.done)
        return this

    var ret = new instance(
        self.value[i],
        false,
        function() {
            i++
            if (i >= self.value.length) {
                do {
                    self.next()
                } while (!self.done && self.value.length === 0)
                
                if (self.done) {
                    ret.done = true
                    return
                }

                i = 0
            }

            ret.value = self.value[i]
        }
    )

    return ret
}

instance.prototype.multimap = function(f) {
    // Like map, but each element can be mapped to multiple elements by returning an array.
    return this.map(f).flatten()
}

instance.prototype.sponge = function(f) {
    // Execute all the previous operations without changing the range by storing it in an array.
    return range.fromArray(f(this.toArray()))
}

instance.prototype.spongeLog = function(tag) {
    // Log the current range. For debugging.
    return this.sponge(function(arr) {
        console.log(tag, arr)
        return arr
    })
}

instance.prototype.toProperty = function(key) {
    // Take a range of values and map it to a range of objects with a key to those values. E.g. [1, 2, 3] => [{x: 1}, {x: 2}, {x: 3}]
    return this.map(function(x) {
        var ret = {}
        ret[key] = x
        return ret
    })
}

instance.prototype.mapProperty = function(key, f) {
    // Like map, but apply to a property.
    return this.do(function(x) {
        x[key] = f(x[key])
    })
}


instance.prototype.combine = function(key, rng) {
    // Augment the objects with a key mapping to another range.
    if (this.done)
        return this

    if (rng.done)
        return rng

    var self = this
    self.value[key] = rng.value

    var ret = new instance(
        self.value,
        false,
        function() {
            self.next()
            rng.next()

            ret.value = self.value

            ret.done = self.done || rng.done

            if (!ret.done) {
                ret.value[key] = rng.value
            }
        }
    )

    return ret
}

instance.prototype.addIndex = function() {
    // Add .index to each object.
    var index = 0

    return this.do(function(x) {
        x.index = index++
    })
}

instance.prototype.log = function() {
    // Do console.log on all the elements.
    this.each(function(x) {
        console.log(x)
    })
}

range.empty = function() {
    // An empty range.
    return new instance(
        0,
        true,
        function(){}
    )
}

range.interval = function(a, b) {
    // An interval from a to b. It's a half-open range, so a is included but b is not.
    var ret = new instance(
        a,
        a >= b,
        function() {
            ret.value++
            ret.done = ret.value >= b
        }
    )

    return ret
}

range.numbers = function(i) {
    // An infinite range starting from i.
    var ret = new instance(
        i,
        false,
        function() {
            i++
            ret.value = i
        }
    )

    return ret
}

range.primes = function() {
    // Generate primes by testing divisibility by previous primes.
    // TODO: Sieve or Eratoshenes should be significantly better.

    var primesSoFar = []
    
    return range.fromGenerator(function() {
        var p = 0

        if (primesSoFar.length < 2) {
            p = primesSoFar.length + 2 // 2 then 3
            primesSoFar.push(p)
            return p
        }

        var x = primesSoFar[primesSoFar.length - 1]
        while (true) {
            x += 2
            var pass = true
            var i = 1 // skip 2 since we're avoiding the even numbers already
            
            while (true) {
                p = primesSoFar[i]

                if (p * p > x) {
                    break
                }

                if (x % p === 0) {
                    pass = false
                    break
                }

                i++
            }
            
            if (pass) {
                primesSoFar.push(x)
                return x
            }
        }
    })
}

range.fromArray = function(arr) {
    // Create a range from an array.
    if (arr.length === 0)
        return range.empty()

    var i = 0

    var ret = new instance(
        arr[0],
        false,
        function() {
            i++
            if (i >= arr.length) {
                ret.done = true
            } else {
                ret.value = arr[i]
            }
        }
    )

    return ret
}

range.single = function(x) {
    // A range with a single element.
    var ret = new instance(
        x,
        false,
        function() { ret.done = true }
    )

    return ret
}

range.fromString = function(str) {
    // Create a range from a string. E.g. 'abc' => ['a', 'b', 'c']
    if (str.length === 0)
        return range.empty()

    var i = 0

    var ret = new instance(
        str[0],
        false,
        function() {
            i++
            if (i >= str.length) {
                ret.done = true
            } else {
                ret.value = str[i]
            }
        }
    )

    return ret
}

range.digits = function(n) {
    // Creates a range from the digits of a number.
    var ret = new instance(
        n % 10,
        n === 0,
        function() {
            n -= ret.value
            if (n === 0) {
                ret.value = 0
                ret.done = true
            }
            n /= 10
            ret.value = n % 10
        }
    )

    return ret
}

range.fromGenerator = function(f) {
    // Creates an infinite range by repeatedly calling f().
    var ret = new instance(
        f(),
        false,
        function() { ret.value = f() }
    )

    return ret
}

range.cross = function(r1, r2) {
    // The cross product of r1 and r2. So e.g. [1, 2], [3, 4] => [[1, 3], [1, 4], [2, 3], [2, 4]]
    // TODO: support infinite ranges using diagonal traversal.

    if (r1.done || r2.done)
        return range.empty()

    var arr1 = r1.toArray()
    var arr2 = r2.toArray()

    var i = 0
    var j = 0

    var ret = new instance(
        [arr1[i], arr2[j]],
        false,
        function() {
            j++
            
            if (j >= arr2.length) {
                j = 0
                i++
                
                if (i >= arr1.length) {
                    ret.done = true
                    return
                }
            }

            ret.value = [arr1[i], arr2[j]]
        }
    )

    return ret
}

range.pair = function(r1, r2) {
    // Convert a pair of ranges into a range of pairs. E.g. [1, 2], [3, 4] => [[1, 3], [2, 4]]
    if (r1.done || r2.done)
        return range.empty()

    var ret = new instance(
        [r1.value, r2.value],
        false,
        function() {
            r1.next()
            r2.next()

            ret.done = (r1.done || r2.done)

            if (!ret.done)
                ret.value = [r1.value, r2.value]
        }
    )

    return ret
}

range.util = {}

range.util.args = function(f) {
    // Wraps f so that calling the result with an array calls f with that argument array.
    return function(arr) {
        return f.apply(undefined, arr)
    }
}

if (module)
    module.exports = range
}())