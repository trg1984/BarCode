/**
 * EAN13
 * Copyright © Rolf Lindén (rolind@utu.fi) 2021
 * Original data from https://en.wikipedia.org/wiki/International_Article_Number
 */

EAN13 = {
    checksumDigit: function(code) {
        return (10 - (
            code
                .split('')
                .map(function(item) { return item | 0 })
                .reverse()
                .map(function(item, index) { return item * (index % 2 == 0 ? 3 : 1) })
                .reduce(function(item, sum) { return sum + item }) % 10
            )) % 10;
    },
    groupMasks: {
        "0": "LLLLLLRRRRRR",
        "1": "LLGLGGRRRRRR",
        "2": "LLGGLGRRRRRR",
        "3": "LLGGGLRRRRRR",
        "4": "LGLLGGRRRRRR",
        "5": "LGGLLGRRRRRR",
        "6": "LGGGLLRRRRRR",
        "7": "LGLGLGRRRRRR",
        "8": "LGLGGLRRRRRR",
        "9": "LGGLGLRRRRRR"
    },
    bars: {
        "0": {L: "0001101", G: "0100111", R: "1110010"},
        "1": {L: "0011001", G: "0110011", R: "1100110"},
        "2": {L: "0010011", G: "0011011", R: "1101100"},
        "3": {L: "0111101", G: "0100001", R: "1000010"},
        "4": {L: "0100011", G: "0011101", R: "1011100"},
        "5": {L: "0110001", G: "0111001", R: "1001110"},
        "6": {L: "0101111", G: "0000101", R: "1010000"},
        "7": {L: "0111011", G: "0010001", R: "1000100"},
        "8": {L: "0110111", G: "0001001", R: "1001000"},
        "9": {L: "0001011", G: "0010111", R: "1110100"}
    },
    convert: function(code) {
        var self = this;
        var first = code[0];
        var groupMask = this.groupMasks[first];
        var arr = ['101']
                    .concat(code.substr(1, 6).split('').map(function(item, index) { return EAN13.bars[item][groupMask[index]] }))
                    .concat(['01010'])
                    .concat(code.substr(7, 12).split('').map(function(item, index) { return EAN13.bars[item][groupMask[6 + index]] }))
                    .concat(['101']);
        return arr;
    },
    binToBars: function(bin) {
        
        a = bin.split('');
        var b = [], prev = '', count = 0;
        for (i in a) {
            if (a[i] === prev) ++count;
            else {
                b.push(count);
                prev = a[i];
                count = 1;
            }
        };
        b.push(count);
        return { firstWhite: bin[0] == '0', bars: b.splice(1) };
    }
}