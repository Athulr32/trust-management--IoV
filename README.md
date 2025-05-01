# IoV Trust Management Prototype

A JavaScript-based prototype for **managing trust in the Internet of Vehicles (IoV)** using **blockchain** and **smart contracts**. Vehicles register with a Road-Side Unit (RSU), exchange messages, and update trust values — all backed by a decentralized Ethereum-compatible blockchain.

## 🔧 Features

- ✅ Blockchain-based vehicle registration and trust management  
- ✅ Cryptographic message signing and verification using `secp256k1`  
- ✅ Dynamic trust updates based on inter-vehicle communication  
- ✅ RSU logic for verification, storage, and decision-making  
- ✅ Smart contract interaction via Web3.js  


## 🧪 Prerequisites

- Node.js ≥ 14  
- Ganache CLI or AVAX testnet endpoint  
- `npm install` dependencies  
- Smart contract deployed on AVAX C-Chain or similar EVM-compatible chain

## 🚀 Getting Started
> ⚠️ **Note:** This project is a **3-year-old prototype** and was built for experimentation. The code is not production-ready and may contain inefficiencies or outdated practices.


### 1. Install dependencies

```bash
npm install
```

### 2. Start your blockchain node

Use Ganache, Hardhat, or connect to AVAX testnet (as configured in RSU.js).

### 3. Deploy the smart contract

Deploy `contract.sol` using Remix or a Hardhat script. Update `ABI.js` and contract address in `RSU.js`.

### 4. Start the RSU server

```bash
node RSU.js
```

### 5. Start vehicle simulations

In two separate terminals:

```bash
node vehicle1.js
node vehicle2.js
```

## 🔐 Trust Workflow

- Vehicles cryptographically sign messages
- RSU verifies messages and stores trust levels on-chain
- Vehicles query RSU to evaluate trust of message senders
- Trust value is adjusted based on message integrity and correctness

## 📡 APIs

- `POST /register` — Register vehicle with RSU  
- `POST /verifyVehicle` — Check if a vehicle is registered and get trust  
- `POST /updateTrustValue` — Update trust score based on behavior  
- `POST /incomingRequest` — Simulate request from another vehicle  

## 🛡 License

MIT License — see [LICENSE](LICENSE)
