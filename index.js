const ethers = require('ethers')
const moment = require("moment")

const json = [
    {
        "ts": moment().format('X'),
        "ONS003A001C3736333815473034": {
            "temperature": 25.3
        },
        "ONS003700323736333815473034": {
            "humidity": 25.3
        },
        "ONS002600473736333813473034": {
            "pressure": 1003.54
        },
        "ONS002A00413736333813473034": {
            "humidity": 25.5
        }
    }
]

const hash = hashJson(json)

// sendHashToBlockchain(hash);
async function sendHashToBlockchain(hash) {
    const contract = connectToSmartContract()

    try {
        const tx = await contract.setHashInfo(hash)

        console.log('PENDING TRANSACTION', {
            hash,
            tx: `https://sepolia.etherscan.io/tx/${tx.hash}`
        })

        await tx.wait()

        console.log('TRANSACTION SUCCESS')
    } catch (e) {
        console.log(e.message)
    }
}


// getHashInfoFromBlockchain(hash)
async function getHashInfoFromBlockchain(hash) {
    const contract = connectToSmartContract()
    const [ownerAddress, timestampBN] = await contract.getHashInfo(hash)
    const hashInfo = {
        hash,
        ownerAddress,
        creationDt: moment(timestampBN.toString(), 'X').format('DD/MM/YYYY HH:mm:ss') // Timestamp a datetime
    }

    console.log('GET HASH INFO', {hashInfo})
}


function connectToSmartContract() {
    const provider = new ethers.providers.JsonRpcProvider(
        'https://rpc.sepolia.org' // Servidor que nos permite comunicarnos con la blockchain remotamente
    )
    const wallet = new ethers.Wallet(
        '216a598f03e036016c5dfeaf397eb4f0a6c490737820e3ce88df717e424bd148',
        provider
    )
    const contract = new ethers.Contract(
        '0xF055A06FAe23e6613d59bd01379Ae3c13eFF3ca9',
        require('./contract-abi.json'), // Es un JSON con todas las funciones del contrato inteligente
        wallet)

    return contract;
}


function listenHashEvents() {
    const contract = connectToSmartContract()

    contract.on('LogNewHash', (hash, ownerAddress, creationDt) => {
        console.log('BLOCKCHAIN EVENT', {
            hash,
            ownerAddress,
            creationDt: moment(creationDt.toString(), 'X').format('DD/MM/YYYY HH:mm:ss')
        })
    })
}


// Creamos un hash KECCAK256 desde un JSON, una alternativa seria un hash SHA256
function hashJson(json) {
    return ethers.utils.id(JSON.stringify(json))
}


