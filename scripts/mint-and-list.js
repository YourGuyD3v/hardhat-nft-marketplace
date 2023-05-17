const { ethers, network } = require("hardhat")
const { moveBlocks } = require("../utils/move_blocks")


const PRICE = ethers.utils.parseEther("0.1")

async function mintAndList() {
    const nftMarketplace = await ethers.getContract("NftMarketplace")
    const basicNft = await ethers.getContract("BasicNft")
    console.log("Minting NFT...")


    const mintNftTx = await basicNft.mintNft()
    const mintNftTxReceipt = await mintNftTx.wait(1)
    const tokenId = await mintNftTxReceipt.events[0].args.tokenId
    console.log("Approving NFT....") 

    const approveTx = await basicNft.approve(nftMarketplace.address, tokenId)
    await approveTx.wait(1)
    console.log("Listing NFT...")

    const lisitng = await nftMarketplace.listItem(basicNft.address, tokenId, PRICE)
    await lisitng.wait(1)
    console.log("NFT Listed!!!")

    if (network.config.chainId == 31337) {
      await moveBlocks(1, (sleepAmount=1000))
    }
    
}

mintAndList()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
})