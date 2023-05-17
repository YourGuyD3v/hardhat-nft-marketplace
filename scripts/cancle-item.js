const { ethers, network } = require("hardhat")
const { moveBlocks } = require("../utils/move_blocks")

const TOKEN_ID = 0
async function cancleItem() {
    const nftMarketplace = await ethers.getContract("NftMarketplace")
    const basicNft = await ethers.getContract("BasicNft")
    const tx = await nftMarketplace.cancleListing(basicNft.address, TOKEN_ID)
    await tx.wait(1)
    console.log("NFT cancled!!")
    if(network.config.chainId == "31337"){
        await moveBlocks(1, (sleepAmount=1000))
    }
}

cancleItem()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error)
    process.exit(1)
})