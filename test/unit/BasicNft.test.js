const { network, ethers, deployments } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
const { assert, expect } = require("chai");

!developmentChains.includes(network.name) ? skip.describe 
: describe("Basic NFT unit testing", function () {
    let basicNft, accounts

    beforeEach(async () => {
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        await deployments.fixture(["all"])
        basicNft = await ethers.getContract("BasicNft")
    })

    describe("constructor", function () {
        it("Initializes the nft correctly", async () => {
            const name = await basicNft.name()
            const symbol = await basicNft.symbol()
            const initializes = await basicNft.getTokenCounter()
            assert.equal(name, "Dogie")
            assert.equal(symbol, "DG")
            assert.equal(initializes, "0")
        })
    })

    describe("Mint NFT", function () {
        it("Mint an NFt and updates the token counter", async () => {
            const mintNft = await basicNft.mintNft()
            await mintNft.wait(1)
            const tokenId = await basicNft.tokenURI(0)
            const tokenCounter = await basicNft.getTokenCounter()
            assert.equal(tokenId, await basicNft.TOKEN_URI())
            assert.equal(tokenCounter.toString(), "1")
        })

        it("emits and event when nft minted", async () => {
            expect(await basicNft.mintNft()).to.emit("DogMinted")
        })

        it("it shows the correct owner", async () => {
            const mintNft = await basicNft.mintNft()
            await mintNft.wait(1)
            const deployerAddress = deployer.address
            const owner = await basicNft.ownerOf("0")
            assert(owner == deployerAddress)
        })
    })    
})