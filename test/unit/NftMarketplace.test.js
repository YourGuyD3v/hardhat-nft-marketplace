const { network, getNamedAccounts, ethers, deployments } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { assert, expect } = require("chai")

!developmentChains.includes(network.name) ? skip.describe
: describe("Nft Marketplace unit testing", function () {
    let nftmarketplace, basicNft, deployer
    const price = ethers.utils.parseEther("0.1")
    const TOKEN_ID = 0

    beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer
        const accounts = await ethers.getSigners()
        player = accounts[1]
        await deployments.fixture(["all"])
        nftmarketplace = await ethers.getContract("NftMarketplace")
        basicNft = await ethers.getContract("BasicNft")
        await basicNft.mintNft()
        await basicNft.approve(nftmarketplace.address, TOKEN_ID)
    })

    describe("listItem", function () {
    it("list and can be bought", async () => {
        await nftmarketplace.listItem(basicNft.address, TOKEN_ID, price)
        const playerConnectedNftMarketplace = await nftmarketplace.connect(player)
        await playerConnectedNftMarketplace.buyItem(basicNft.address, TOKEN_ID, { value: price })
        const newOwner = await basicNft.ownerOf(TOKEN_ID)
        const deployerProceeds = await nftmarketplace.getProceeds(deployer)
        assert(deployerProceeds.toString() == price.toString())
        assert(newOwner.toString() == player.address)
    })

    it("reverts if price is <= 0", async () => {
        await expect(nftmarketplace.listItem(basicNft.address, TOKEN_ID, "0")).to.be.revertedWith(
            "NftMarketplace__priceMustBeAboveZero")
    })

    it("reverts if address is not approved", async () => {
        await basicNft.approve(ethers.constants.AddressZero, TOKEN_ID)
        await expect(nftmarketplace.listItem(basicNft.address, TOKEN_ID, price)).to.be.revertedWith(
            "NftMarketplace__NotApprovedForMarketplace")
    })

    it("exclusively items that haven't been listed", async () => {
        expect( await nftmarketplace.listItem(basicNft.address, TOKEN_ID, price)).to.be.revertedWith(
            "NftMarketplace__AlreadyListed")
    })

    it("allows owner to list", async () => {
        nftmarketplace = await nftmarketplace.connect(player)
        await basicNft.approve(player.address, TOKEN_ID)
       await expect( nftmarketplace.listItem(basicNft.address, TOKEN_ID, price)).to.be.revertedWith(
            "NftMarketplace__NotOwner")
    })

    it("emits an event when item is being listed", async () => {
        expect( await nftmarketplace.listItem(basicNft.address, TOKEN_ID, price)).to.emit(
            "ItemListed")
    })

    it("Updates listing with seller and price", async () => {
        await nftmarketplace.listItem(basicNft.address, TOKEN_ID, price)
        const listing = await nftmarketplace.getListings(basicNft.address, TOKEN_ID)
        assert(listing[0].toString() == deployer)
        assert(listing[1].toString() == price.toString())
    })
    })

    describe("buyItem", function () {
        it("it reverts if there is no listed", async () => {
            await expect(nftmarketplace.buyItem(basicNft.address, TOKEN_ID)).to.be.revertedWith(
                "NftMarketplace__NoListed")
        })

        it("reverts if price is less then listed price", async () => {
            await nftmarketplace.listItem(basicNft.address, TOKEN_ID, price)
            await expect(nftmarketplace.buyItem(basicNft.address, TOKEN_ID, { value: "0"})).to.be.revertedWith(
                "NftMarketplace__PriceNotMet")
        })

        it("transfers the nft to the buyer and updates internal proceeds record", async () => {
            await nftmarketplace.listItem(basicNft.address, TOKEN_ID, price)
            const playerConnectedNftMarketplace = await nftmarketplace.connect(player)
            expect(
                await playerConnectedNftMarketplace.buyItem(basicNft.address, TOKEN_ID, { value: price })
            ).to.emit("ItemBought")
            const newOwner = await basicNft.ownerOf(TOKEN_ID)
            const proceeds = await nftmarketplace.getProceeds(deployer)
            assert(newOwner == player.address)
            assert(proceeds.toString() == price.toString())
        })      
    })

    describe("cancleListing", function () {
        it("emit an event when item is deleted", async () => {

            await nftmarketplace.listItem(basicNft.address, TOKEN_ID, price)
            const playerConnectedNftMarketplace = await nftmarketplace.connect(player)
            expect(await playerConnectedNftMarketplace.buyItem(basicNft.address, TOKEN_ID, { value : price})).to.emit(
                "ItenCanceled")
        })
    })

    describe("updatingItem", async () => {
        it("updates the price of item", async () => {
            const updatedPrice = ethers.utils.parseEther("0.2")
            await nftmarketplace.listItem(basicNft.address, TOKEN_ID, price)
            expect(await nftmarketplace.updateListing(basicNft.address, TOKEN_ID, updatedPrice)).to.emit(
                "ItemListed")
                const listing = await nftmarketplace.getListings(basicNft.address, TOKEN_ID)
                assert(listing.price.toString() == updatedPrice.toString())
        })
    })

    describe("withdrawProceeds", function () {
        it("reverts if withdraws no ETH", async () => {
            await expect( nftmarketplace.withdrawProceeds()).to.be.revertedWith(
                "NftMarketplace__NoProceeds")
        })

        it("reverts if transfer failed", async () => {
            UPDATED_PRICE = ethers.utils.parseEther("0.2")
            await nftmarketplace.listItem(basicNft.address, TOKEN_ID, price)
            const playerConnectedNftMarketplace = await nftmarketplace.connect(player)
            await playerConnectedNftMarketplace.buyItem(basicNft.address, TOKEN_ID, { value: UPDATED_PRICE})
            expect( await nftmarketplace.withdrawProceeds())
            .to.be.revertedWith(
                "NftMarketplace__TransferFailed")
        })
    })
})