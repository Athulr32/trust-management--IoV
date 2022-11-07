const { bin2hex, decToBin, fromHexString } = require("./conversion")
const crypto = require("crypto")
const secp256k1 = require('secp256k1')
const { ethers } = require("ethers");
const keccak256 = require('js-sha3').keccak256;
const EC = require('elliptic').ec;
const express = require("express");
const app = express();
const cors = require('cors')
var ec = new EC('secp256k1');



const Web3 = require('web3');           //for web3 calls
const Tx = require('ethereumjs-tx').Transaction;    //for Tx calls


const { abi } = require("./ABI");
const { ppid } = require("process");
const { ripemd160 } = require("ethers/lib/utils");
const web3 = new Web3(new Web3.providers.HttpProvider("https://api.avax-test.network/ext/bc/C/rpc"));
const contractAddress = "0x55de8FB09733472C6Fb68804Ed865B48d58B5871"



// const provider = new ethers.providers.JsonRpcProvider("https://api.avax-test.network/ext/bc/C/rpc");

//For RSU
let privKeyRsu = "2670dcc196727cd22823dc575e7c50e3a6e48b80b1b5a2e213242a2c3ab628b8";
let privateKey = Buffer.from(privKeyRsu, 'hex')
const privKeyRsuByte = fromHexString(privKeyRsu)

// get the public key in a compressed format
const publicKeyRsu = secp256k1.publicKeyCreate(privKeyRsuByte);
let publicKeyRsuHex = "03d47b61fcc919803a211309b1c2aa50e68afae3753a35e511f95b328b5ba344e0";


//Converting public key to address
// Import public key
var key = ec.keyFromPrivate(privKeyRsu, 'hex');

// Convert to uncompressed format
const publicKeyUncompressedRsu = key.getPublic().encode('hex').slice(2);

// Now apply keccak
const addressRsu = keccak256(Buffer.from(publicKeyUncompressedRsu, 'hex')).slice(64 - 40);

console.log('Address', addressRsu)

// const wallet = new ethers.Wallet(privKeyRsuByte,provider)


//Contract object
const contract = new web3.eth.Contract(abi, contractAddress, {
    from: addressRsu,
    gasLimit: 3000000,
});





function callFunctionInContract(contractFunction) {

    const functionAbi = contractFunction.encodeABI(); // this will generate contract function abi code

    contractFunction.estimateGas({ from: addressRsu }).then((gasAmount) => {

        gasAmount = gasAmount * 1000000
        console.log("Estimated gas: " + gasAmount);
        let estimatedGas = gasAmount.toString(16);



        web3.eth.getTransactionCount(addressRsu).then(_nonce => { //this will generate Nonce
            let nonce = _nonce.toString(16);

            console.log("Nonce: " + nonce);

            const txParams = {
                gasPrice: "0x" + estimatedGas,
                gasLimit: 3000000,
                to: contractAddress,
                data: functionAbi,
                from: addressRsu,
                nonce: "0x" + nonce,
            };

            let signedTx;

            (async () => {
                signedTx = await web3.eth.accounts.signTransaction(txParams, privKeyRsu);


                web3.eth.sendSignedTransaction(signedTx.rawTransaction, function (error, hash) {
                    if (!error) {
                        console.log("🎉 The hash of your transaction is: ", hash);
                    } else {
                        throw error;
                    }
                });
            })()


        });
    });



}







//Routes For connecting to Vehicle

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

app.use("/register", (req, res) => {

    //Will send the entire thing to ALL other RSU
    //TO confirm the transaction in the blockchain SO a particular RSU got hacked cannot manipulate the blockchain
    const msg = req.body.msg;
    const signObj = req.body.msg;
    const pubKey = req.body.pubKey;

    
    //Verify if the sender message;
    const msgAuthenticity = secp256k1.ecdsaVerify(signObj.signature, msg, pubKey);
    if (!msgAuthenticity) {
        res.status(400).json({
            msg: "Invalid msg"
        })
    }

    //Check if location is valid
    //If yes add the public key and the location in smart contract
    const contractFunction = contract.methods.authVehicle("0x373f85D1943d9b5D135Ca05164BD09d93e3720A8", "wefe");

    try {
        callFunctionInContract(contractFunction);

        res.status(200).json({
            msg: "registered",
            pubkey: pubKey
        })

    } catch (error) {
        res.status(400).json({
            msg: "Invalid msg"
        })
    }




})

app.use("/verifyVehicle", async (req, res) => {

    const pubKey = req.body.pubkey;
    const verifyVehicleFunction = contract.methods.verifyVehicle("0xB9220905FCD0FB72762AeE085785e36Be4cb4e67");
    const isVehicleVerified = await verifyVehicleFunction.call()

    if (isVehicleVerified){
        const getLocationFunction = contract.methods.getTrustValueAndLocation("0xB9220905FCD0FB72762AeE085785e36Be4cb4e67")
        const trustAndLocation = await getLocationFunction.call()
        res.json({
            msg:trustAndLocation
        })
    }
    else{
        res.json({
            msg:"Vehicle Not registered"
        })
    }



})


app.use("/updateTrustValue",(req,res)=>{

    //Whole details will be sent to Another RSU also
    //Information send by other vehicle
    const msg=req.body.msg;
    //Check if timestamp is correct
    const signObj = req.body.msg;
    const pubKeyofVeh = req.body.pubKeyVeh


    const trustValue = req.body.trust;
    const pubKey = req.body.pubkey;
 

    if(trustValue === 0){
        const getLocationFunction = contract.methods.updateTrustValue("0xB9220905FCD0FB72762AeE085785e36Be4cb4e67",-20)
        callFunctionInContract(getLocationFunction)
        res.json({
            msg:"Updated",

        })
    }

    const getLocationFunction = contract.methods.updateTrustValue("0xB9220905FCD0FB72762AeE085785e36Be4cb4e67",20)
    res.json({
        msg:"Updated",

    })

})


app.use("/inforeq",async (req,res)=>{

    const location = req.body.location;
    //RSU will route to another RSU based on location
    //At last it will reach an RSU in that current location
    //That RSU will send the request to vehicle in that location

    const rrsp = await fetch("localhost:4001/incomingRequest")


})


app.use("/", (req, res) => {
    res.json({ data: "test" })
})

app.listen(30010)
console.log("Started")







