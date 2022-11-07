const { bin2hex, decToBin,fromHexString } = require("./conversion")
const crypto = require("crypto")
const secp256k1 = require('secp256k1')
const keccak256 = require('js-sha3').keccak256;
const EC = require('elliptic').ec;
var ec = new EC('secp256k1');


let privKey
do {
  privKey = crypto.randomBytes(32)
} while (!secp256k1.privateKeyVerify(privKey))

const privKeyHex = privKey.toString('hex')
console.log( "Private Key",privKeyHex)


const pubKey = secp256k1.publicKeyCreate(privKey);

// let pubBit = ""
// for (let i = 0; i < pubKey.length; i++) {

//     pubBit = pubBit + decToBin(pubKey[i]);

// }

// const pubKeyHex = bin2hex(pubBit);

// console.log("PubKey hex", pubKeyHex)


//Converting public key to address
// Import public key
var key = ec.keyFromPrivate(privKey);

// Convert to uncompressed format
const publicKeyUncompressed = key.getPublic().encode('hex').slice(2);

// Now apply keccak
const address = keccak256(Buffer.from(publicKeyUncompressed, 'hex')).slice(64 - 40);
console.log("Address",address)


//Message to send
let arr = new Uint8Array(32);
const msg = Date.now().toString();

arr = arr.map((v,i)=>{
  return msg[i]
})
console.log(arr)
//Sign the Message
const sigObj = secp256k1.ecdsaSign(arr, privKey)
console.log(sigObj)
//verify the message using  senders public key
const msgAuthenticity = secp256k1.ecdsaVerify(sigObj.signature, arr, pubKey)

console.log(msgAuthenticity)