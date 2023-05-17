const { ethers, network } = require("hardhat")
const { moveBlocks } = require("../utils/move_blocks")

const TOKEN_ID = 0

async function itemBought() {
const nftMarketplace = await ethers.getContract("NftMarketplace")
const basicNft = await ethers.getContract("BasicNft")
const lisitng = await nftMarketplace.getListings(basicNft.address, TOKEN_ID)
const price = lisitng.price.toString()
const tx = await nftMarketplace.buyItem(basicNft.address, TOKEN_ID, {value: price})
await tx.wait(1)
console.log("NFT Bought!!")
if(network.config.chainId == "31337"){
    await moveBlocks(1, (sleepAmount=1000))
}
}

itemBought()
.then(() => process
.exit(0)).catch((error) => {
    console.error(error)
    process.exit(1)
})