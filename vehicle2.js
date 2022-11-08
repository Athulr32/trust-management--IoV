const { bin2hex, decToBin, fromHexString } = require("./conversion")
const crypto = require("crypto")
const secp256k1 = require('secp256k1')
const { ethers } = require("ethers");
const keccak256 = require('js-sha3').keccak256;
const EC = require('elliptic').ec;
var ec = new EC('secp256k1');
const cors = require('cors')
const express = require("express")
const app = express()
const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});




//For vehicle
let privKeyHex = "3c41dd25b3ac2a2aea18aa2528b73e55072058bb0e37ed6d6d73d2cbf105d929"

//Private key in byte
const privKey = fromHexString(privKeyHex)


// get the public key in a compressed format
const pubKey = secp256k1.publicKeyCreate(privKey);

//Converting public key to address
// Import public key
var key = ec.keyFromPublic(pubKey);

// Convert to uncompressed format
const publicKeyUncompressed = key.getPublic().encode('hex').slice(2);

// Now apply keccak
const address = keccak256(Buffer.from(publicKeyUncompressed, 'hex')).slice(64 - 40);

console.log('Address', address)


app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors())

//Request from vehicle about a particular event
//And RSU will also send this and a nearby vehicle also
app.use("/incomingRequest", (req, res) => {
    console.log('Recieved a Request\n');
    console.log("Observing the event")
    const msg = req.body.msg;
    const signObj = req.body.signObj
    const pubKeyA = req.body.pubKey;

    const signObjT = Object.values(signObj.signature);
    const realSignObj = Uint8Array.from(signObjT)

    const msgArr = Object.values(msg)
    const realMsg = Buffer.from(msgArr)

    const pubKeyT = Object.values(pubKeyA)
    const realPubKey = Uint8Array.from(pubKeyT)



    //Verify if the sender message;
    const msgAuthenticity = secp256k1.ecdsaVerify(realSignObj, realMsg, realPubKey)

    if (msgAuthenticity) {

        const msg = "Traffic block";

        let arr = new Uint8Array(32);


        arr = arr.map((v, i) => {
            return msg[i]
        })

        //Sign the Message
        const signObj = secp256k1.ecdsaSign(arr, privKey)
        //Read the msg and notice the event and send that event to vehicle
        console.log("Sending the requested DATA")
        res.json({
            msg,
            msgObj:arr,
            signObj,
            pubKey
        })


    }

})


app.use("/sendMessage", async (req, res) => {

    console.log('Recieved a Message');

    const msg = req.body.msg;
    const signObj = req.body.signObj
    const pubKey = req.body.pubKey;

    const signObjT = Object.values(signObj.signature);
    const realSignObj = Uint8Array.from(signObjT)

    const msgArr = Object.values(msg)
    const realMsg = Buffer.from(msgArr)

    const pubKeyT = Object.values(pubKey)
    const realPubKey = Uint8Array.from(pubKeyT)

    var key = ec.keyFromPublic(realPubKey);

    // Convert to uncompressed format
    const publicKeyUncompressed = key.getPublic().encode('hex').slice(2);

    // Now apply keccak
    const address = keccak256(Buffer.from(publicKeyUncompressed, 'hex')).slice(64 - 40);

    console.log('Checking Message Authenticity...')
    //Verify if the sender message;
    const msgAuthenticity = secp256k1.ecdsaVerify(realSignObj, realMsg, realPubKey)



    if (msgAuthenticity) {

        console.log("Verified!!")
        const locOfcurretnVeh = "";

        //Verify the vehicle and get the location of trust value
        const resp = await fetch("http://localhost:3012/verifyVehicle", {
            method: 'POST',
            body: JSON.stringify({ address }),
            headers: { 'Content-Type': 'application/json' },
        })
        const rsuRes = await resp.json();
        //Compare the location and decide whether to accept the msg based on trust value
        console.log(rsuRes)
        const trustValue = rsuRes.msg['0'];
        console.log("Trust Value is", trustValue);
        let flag = true

        // if (Number(trustValue) > 40) {
        //     console.log("HI")
        //     rl.question("DO you want to accept?Yes/No", (ans) => {
        //         ans == "Yes" ? flag = true : flag = false;
        //     })
        // }
        //Now update trust Value
        if (flag == true) {
            console.log("Checking info is correct");
            console.log("Updating Trust value")
            const trustRes = await fetch("http://localhost:3012/updateTrustValue", {
                method: 'POST',
                body: JSON.stringify({
                    trust: true,
                    msg: msg,
                    signObj: signObj,
                    pubKey: pubKey
                }),
                headers: { 'Content-Type': 'application/json' },
            })
            console.log(await trustRes.json())
            //If information is correct update the trust value
            res.json({
                msg: "success"
            })
        }
        else {
            res.json({
                msg: "Trust value low"
            })
        }

    }
    else {
        res.json({
            msg: "success"
        })
    }



})

app.listen(5001);



function input() {
    rl.question("Enter 1 to Send Message to Nearby vehicle About an event\nEnter 2 to send a request to vehicle for info\n ", async function (res) {
        if (res === "1") {
            //Send message to nearby vehicle about any event that happened
            //Send the event,pubkey,and signed Message
            let arr = new Uint8Array(32);
            const msg = Date.now().toString();

            arr = arr.map((v, i) => {
                return msg[i]
            })
            //Sign the Message
            const signObj = secp256k1.ecdsaSign(arr, privKey)

            const data = {
                msg: arr,
                signObj: signObj,
                pubKey: pubKey
            }
            console.log("Sending Message....")
            const resp = await fetch("http://localhost:4005/sendMessage", {
                method: 'POST',
                body: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json' },
            })

            const vehres = await resp.json();
            console.log(vehres.msg)

            input()
        }
         else if(res==="2") {
            //Send request to nearby Vehicle
            rl.question("What information you want", async (info) => {

                let arr = new Uint8Array(32);
                const msg = Date.now().toString();

                arr = arr.map((v, i) => {
                    return msg[i]
                })
                //Sign the Message
                const signObj = secp256k1.ecdsaSign(arr, privKey)

                const data = {
                    msg: arr,
                    signObj: signObj,
                    pubKey: pubKey
                }

                console.log('Sending Request....\n')

                const resp = await fetch("http://localhost:4005/incomingRequest", {
                    method: 'POST',
                    body: JSON.stringify(data),
                    headers: { 'Content-Type': 'application/json' },
                })

               const respRec = await resp.json()
               const msgRec = respRec.msg;
               const signObjRec = respRec.signObj
               const pubKeyRec = respRec.pubKey;
                const msgObject = respRec.msgObj
               const signObjT = Object.values(signObjRec.signature);
               const realSignObj = Uint8Array.from(signObjT)
              
               const msgArr = Object.values(msgObject)
               const realMsg = Buffer.from(msgArr)
           
               const pubKeyT = Object.values(pubKeyRec)
               const realPubKey = Uint8Array.from(pubKeyT)
           
               var key = ec.keyFromPublic(realPubKey);
           
               // Convert to uncompressed format
               const publicKeyUncompressed = key.getPublic().encode('hex').slice(2);
           
           
               // Now apply keccak
               const address = keccak256(Buffer.from(publicKeyUncompressed, 'hex')).slice(64 - 40);
           
           
               //Verify if the sender message;
               const msgAuthenticity = secp256k1.ecdsaVerify(realSignObj, realMsg, realPubKey)

               if (msgAuthenticity) {
                console.log("Verified!!")
                //Location of current vehicle
                const locOfcurretnVeh = "";
                console.log("The recieved message is",msgRec)
                //Verify the vehicle and get the location of trust value
                const resp = await fetch("http://localhost:3012/verifyVehicle", {
                    method: 'POST',
                    body: JSON.stringify({ address }),
                    headers: { 'Content-Type': 'application/json' },
                })
                const rsuRes = await resp.json();
                //Compare the location and decide whether to accept the msg based on trust value
                console.log(rsuRes)
                const trustValue = rsuRes.msg['0'];
                console.log("Trust Value is", trustValue);
                //Now update trust Value
        
                const trustRes = await fetch("http://localhost:3012/updateTrustValue", {
                    method: 'POST',
                    body: JSON.stringify({
                        trust: true,
                        msg: msgObject,
                        signObj: signObjRec,
                        pubKey: pubKeyRec
                    }),
                    headers: { 'Content-Type': 'application/json' },
                })
                console.log(await trustRes.json())
                //If information is correct update the trust value
           
                input()
            }
                //After getting info check if the message is valid using signature
                //If yes get the trust value of that vehicle
                //And accept message according to trust value
                //And update the trust value

            })

        }
        else{


            rl.question("What information you want", async (info) => {

                let arr = new Uint8Array(32);
                const msg = Date.now().toString();

                arr = arr.map((v, i) => {
                    return msg[i]
                })
                //Sign the Message
                const signObj = secp256k1.ecdsaSign(arr, privKey)

                const data = {
                    msg: arr,
                    signObj: signObj,
                    pubKey: pubKey
                }

                console.log('Sending Request to RSU....\n')

                const resp = await fetch("http://localhost:3012/incomingRequest", {
                    method: 'POST',
                    body: JSON.stringify(data),
                    headers: { 'Content-Type': 'application/json' },
                })
                console.log(await resp.json())
                //After getting info check if the message is valid using signature
                //If yes get the trust value of that vehicle
                //And accept message according to trust value
                //And update the trust value

            })
        }
        
    });
}

input()


async function registering() {

    //Message to send
    let arr = new Uint8Array(32);
    const msg = Date.now().toString();

    arr = arr.map((v, i) => {
        return msg[i]
    })
    //Sign the Message
    const signObj = secp256k1.ecdsaSign(arr, privKey)
    const randNum = (Math.random() * 100).toString();
    const data = {
        msg: arr,
        signObj: signObj,
        pubKey: pubKey,
        address: address,
        location: randNum
    }



    const verres = await fetch("http://localhost:3012/register", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },

    })
    const reg = await verres.json()
    if (reg.msg === "registered") {
        console.log("Vehicle has been registered")
    }
    else {
        console.log("vehicle not regsitered")
    }


}

registering().then(() => {
    input()
})

