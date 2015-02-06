"use strict";

var range = require("./range.js")

var solutions = [
    function p1() {
        return range
            .interval(1, 1000)
            .filter(function(x) {
                return x % 3 === 0 || x % 5 === 0
            })
            .sum()
    },
    function p2() {
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
    },
    function p3() {
        var n = 600851475143
        var largestP = 0

        range
            .primes()
            .eachWhile(function(p) {
                if (n % p !== 0)
                    return true

                largestP = p

                do {
                    n /= p
                } while (n % p === 0)

                return p * p < n
            })

            largestP = Math.max(largestP, n)

            return largestP
    },
    function p4() {
        return range
            .cross(
                range.interval(100, 1000),
                range.interval(100, 1000))
            .map(function(x) { return x[0] * x[1] })
            .filter(function(x) { return range.digits(x).isPalindrome() })
            .max()
    },
    function p5() {
        
    },
    function p6() { return 'unsolved' },
    function p7() { return 'unsolved' },
    function p8() {
        var digits = "7316717653133062491922511967442657474235534919493496983520312774506326239578318016984801869478851843858615607891129494954595017379583319528532088055111254069874715852386305071569329096329522744304355766896648950445244523161731856403098711121722383113622298934233803081353362766142828064444866452387493035890729629049156044077239071381051585930796086670172427121883998797908792274921901699720888093776657273330010533678812202354218097512545405947522435258490771167055601360483958644670632441572215539753697817977846174064955149290862569321978468622482839722413756570560574902614079729686524145351004748216637048440319989000889524345065854122758866688116427171479924442928230863465674813919123162824586178664583591245665294765456828489128831426076900422421902267105562632111110937054421750694165896040807198403850962455444362981230987879927244284909188845801561660979191338754992005240636899125607176060588611646710940507754100225698315520005593572972571636269561882670428252483600823257530420752963450"

        return range
            .fromString(digits)
            .map(parseInt)
            .window(13)
            .map(function(w) { return w.product() })
            .max()
    }
]

range.fromArray(solutions).each(function(p) {
    console.log(p())
})