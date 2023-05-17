const { ethers, network } = require("hardhat")
const fs = require("fs")

const frontendContractFile = "../nextjs-nft-marketplace-thegraph/constants/networkMapping.json"
const frontendAbiLocation = "../nextjs-nft-marketplace-thegraph/constants/"
module.exports = async function () {
    if(process.env.UPDATED_FRONT_END) {
        console.log("Updating frontend...")
        await updateContractAddresses()
        await updateContractAbi()
    }
}
    async function updateContractAbi() {
        const nftMarketplace = await ethers.getContract("NftMarketplace")
        fs.writeFileSync(`${frontendAbiLocation}NftMarketplace.json`,
        nftMarketplace.interface.format(ethers.utils.FormatTypes.json))

        const basicNft = await ethers.getContract("BasicNft")
        fs.writeFileSync(`${frontendAbiLocation}BasicNft.json`,
        basicNft.interface.format(ethers.utils.FormatTypes.json))
    }

    async function updateContractAddresses() {
        const nftMarketplace = await ethers.getContract("NftMarketplace")
        const chainId = network.config.chainId.toString()
        const contractAddresses = JSON.parse(fs.readFileSync(frontendContractFile, "utf8"))
        if (chainId in contractAddresses) {
            if (!contractAddresses[chainId]["NftMarketplace"].includes(nftMarketplace.address)) {
                contractAddresses[chainId]["nftMarketplace"].push(nftMarketplace.address)
            }
            } else {
                contractAddresses[chainId] = {"NftMarketplace": [nftMarketplace.address]}
        }
        fs.writeFileSync(frontendContractFile, JSON.stringify(contractAddresses))
    }

    module.exports.tags = ["all", "frontend"]
