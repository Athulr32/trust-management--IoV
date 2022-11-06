const { bin2hex, decToBin,fromHexString } = require("./conversion")
const crypto = require("crypto")
const secp256k1 = require('secp256k1')
const { ethers } = require("ethers");
const keccak256 = require('js-sha3').keccak256;
const EC = require('elliptic').ec;

var ec = new EC('secp256k1');
const provider = new ethers.providers.JsonRpcProvider("https://api.avax-test.network/ext/bc/C/rpc");


//For vehicle
//Generate Private Key
// do {
//   privKey = crypto.randomBytes(32)
// } while (!secp256k1.privateKeyVerify(privKey))


//For vehicle
let privKeyHex = "cd9a22bb430b4e172ddef03638d565221d315835f888aaa47e4946ec1dc4e2f6"

//Private key in byte
const privKey = fromHexString(privKeyHex)


// get the public key in a compressed format
const pubKey = secp256k1.publicKeyCreate(privKey);

// let pubBit = ""
// for (let i = 0; i < pubKey.length; i++) {

//     pubBit = pubBit + decToBin(pubKey[i]);

// }

// const pubKeyHex = bin2hex(pubBit);
// console.log("PubKey hex", pubKeyHex)

const pubKeyVehicle = "03d47b61fcc919803a211309b1c2aa50e68afae3753a35e511f95b328b5ba344e0";

//Converting public key to address
// Import public key
var key = ec.keyFromPrivate(privKeyHex, 'hex');

// Convert to uncompressed format
const publicKeyUncompressed = key.getPublic().encode('hex').slice(2);

// Now apply keccak
const address = keccak256(Buffer.from(publicKeyUncompressed, 'hex')).slice(64 - 40);

console.log('Address',address)



//Message to send
const msg = crypto.randomBytes(32)

//Sign the Message
const sigObj = secp256k1.ecdsaSign(msg, privKey)

//verify the message using  senders public key
const msgAuthenticity = secp256k1.ecdsaVerify(sigObj.signature, msg, pubKey)

console.log(msgAuthenticity)

// (async () => {
//     console.log(await provider.getBlockNumber())
// }
// )()



//For RSU
let privKeyRsu="2670dcc196727cd22823dc575e7c50e3a6e48b80b1b5a2e213242a2c3ab628b8";
const privKeyRsuByte = fromHexString(privKeyRsu)

// get the public key in a compressed format
const publicKeyRsu = secp256k1.publicKeyCreate(privKey);
let publicKeyRsuHex = "03d47b61fcc919803a211309b1c2aa50e68afae3753a35e511f95b328b5ba344e0";

//Converting public key to address
// Import public key
var key = ec.keyFromPrivate(privKeyRsu, 'hex');

// Convert to uncompressed format
const publicKeyUncompressedRsu = key.getPublic().encode('hex').slice(2);

// Now apply keccak
const addressRsu = keccak256(Buffer.from(publicKeyUncompressedRsu, 'hex')).slice(64 - 40);

console.log('Address',addressRsu)



const wallet = new ethers.Wallet(privKeyRsuByte,provider)

async function test(){

    console.log(await wallet.getBalance())
}

test()

