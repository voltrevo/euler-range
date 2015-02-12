"use strict";

var range = {}

;(function(){

function instance(value, done, next) {
    this.value = value
    this.done = done
    this.next = next
}

instance.prototype.do = function(f) {
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
    var self = this
    var oldNext = self.next

    self.next = function() {
        f(self.value)
        oldNext()
    }

    return self
}

instance.prototype.each = function(f) {
    while (!this.done) {
        f(this.value)
        this.next()
    }
}

instance.prototype.eachWhile = function(f) {
    while (!this.done) {
        if (!f(this.value)) {
            return false
        }
        this.next()
    }

    return true
}

instance.prototype.filter = function(f) {
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

instance.prototype.min = function() { return this.fold(Infinity, Math.min) }
instance.prototype.max = function() { return this.fold(-Infinity, Math.max) }

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

instance.prototype.toArray = function() {
    var arr = []
    this.each(function(x) { arr.push(x) })
    return arr
}

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

instance.prototype.tail = function(n) {
    return this.window(n).last()
}

instance.prototype.first = function() { return this.value }

instance.prototype.last = function() {
    var last

    while (!this.done) {
        last = this.value
        this.next()
    }

    return last
}

instance.prototype.length = function() {
    var len = 0
    while (!this.done) {
        len++
        this.next()
    }
    return len
}

instance.prototype.flatten = function() {
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
    return this.map(f).flatten()
}

instance.prototype.sponge = function(f) {
    return range.fromArray(f(this.toArray()))
}

instance.prototype.spongeLog = function(tag) {
    return this.sponge(function(arr) {
        console.log(tag, arr)
        return arr
    })
}

instance.prototype.toProperty = function(key) {
    return this.map(function(x) {
        var ret = {}
        ret[key] = x
        return ret
    })
}

instance.prototype.mapProperty = function(key, f) {
    return this.do(function(x) {
        x[key] = f(x[key])
    })
}

instance.prototype.combine = function(key, rng) {
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
    var index = 0

    return this.do(function(x) {
        x.index = index++
    })
}

instance.prototype.log = function() {
    this.each(function(x) {
        console.log(x)
    })
}

range.empty = function() {
    return new instance(
        0,
        true,
        function(){}
    )
}

range.interval = function(a, b) {
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
    var ret = new instance(
        x,
        false,
        function() { ret.done = true }
    )

    return ret
}

range.fromString = function(str) {
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
    var ret = new instance(
        f(),
        false,
        function() { ret.value = f() }
    )

    return ret
}

range.cross = function(r1, r2) {
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
    return function(arr) {
        return f.apply(undefined, arr)
    }
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

if (module)
    module.exports = range
}())