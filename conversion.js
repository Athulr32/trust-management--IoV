function decToBin(dec,len=8) {

    let r;
    let binary = "";
    while (dec > 0) {

        r = dec % 2;
        binary = binary + String(r);
        dec = Math.floor(dec / 2);

    }

    if (binary.length !== len) {

        let n = binary.length;

        for (let i = 0; i < len - n; i++) {
            binary = binary + "0";
        }

    }

    return binary.split("").reverse().join("");

}

function bin2hex(b) {
    return b.match(/.{4}/g).reduce(function (acc, i) {
        return acc + parseInt(i, 2).toString(16);
    }, '')
}

const fromHexString = (hexString) =>
    Uint8Array.from(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));


exports.decToBin =decToBin;
exports.bin2hex = bin2hex;
exports.fromHexString = fromHexString