// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

error NftMarketplace__AlreadyListed(address nftAddress, uint256 tokenId);
error NftMarketplace__NoListed(address nftAddress, uint256 tokenId);
error NftMarketplace__PriceNotMet(address nftAddress, uint256 tokenId, uint256 price);
error NftMarketplace__priceMustBeAboveZero();
error NftMarketplace__NotApprovedForMarketplace();
error NftMarketplace__NotOwner();
error NftMarketplace__NoProceeds();
error NftMarketplace__TransferFailed();

contract NftMarketplace is ReentrancyGuard {
    struct Listing  {
        address seller;
        uint256 price;
    }

    event ItemListed(
        address indexed nftAddress,
        uint256 indexed tokenId,
        address  indexed seller,
         uint256 price
    );

    event ItemBought(
        address indexed buyer,
        address indexed nftAdress,
        uint256 indexed tokenId,
        uint256 price
    );

    event ItemCanceled(
        address indexed nftAddress,
        uint256 indexed tokenId,
        address indexed seller
    );

    // mapping
    mapping(address => mapping(uint256 => Listing)) private s_listings;
    mapping(address => uint256) private s_proceeds;

     ///////////////////////
    ///    Modifier     ///
   ///////////////////////

   modifier notListed (
    address nftAddress,
    uint256 tokenId,
    address onwer
   ) {
    Listing memory listing = s_listings[nftAddress][tokenId];
    if (listing.price > 0) {
        revert NftMarketplace__AlreadyListed(nftAddress, tokenId);
    }
    _;
   }

    modifier isListed(address nftAddress,
   uint256 tokenId) {
    Listing memory listing = s_listings[nftAddress][tokenId];
    if (listing.price <= 0) {
        revert NftMarketplace__NoListed(nftAddress, tokenId);
    }
    _;
   }


   modifier isOwner(address nftAddress,
   uint256 tokenId,
   address spender) {
    IERC721 nft = IERC721(nftAddress);
    address onwer = nft.ownerOf(tokenId);
    if (spender != onwer) {
        revert NftMarketplace__NotOwner();
    }
    _;
   }

    ////////////////////////
   ///  Main Functions  ///
  ////////////////////////

  function listItem(address nftAddress, uint256 tokenId, uint256 price)
   external 
  notListed(nftAddress, tokenId, msg.sender) 
  isOwner(nftAddress, tokenId, msg.sender) {
    if (price <= 0) {
        revert NftMarketplace__priceMustBeAboveZero();
    }

    IERC721 nft = IERC721(nftAddress);
    if (nft.getApproved(tokenId) != address(this)) {
        revert NftMarketplace__NotApprovedForMarketplace();
    }

    s_listings[nftAddress][tokenId] = Listing(msg.sender, price);
    emit ItemListed(nftAddress, tokenId, msg.sender, price);
  }

  function buyItem(address nftAddress, uint256 tokenId) external payable 
  nonReentrant()
  isListed(nftAddress, tokenId) {
    Listing memory listedItem = s_listings[nftAddress][tokenId];
    if (msg.value < listedItem.price) {
        revert NftMarketplace__PriceNotMet(nftAddress, tokenId, listedItem.price);
    }
        s_proceeds[listedItem.seller] += msg.value;

        delete (s_listings[nftAddress][tokenId]);
        IERC721(nftAddress).safeTransferFrom(listedItem.seller, msg.sender, tokenId);
        emit ItemBought(msg.sender, nftAddress, tokenId, listedItem.price);
  }

  function cancleListing(address nftAddress, uint256 tokenId) external 
  isOwner(nftAddress, tokenId, msg.sender) 
  isListed(nftAddress, tokenId) {

    delete s_listings[nftAddress][tokenId];
    emit ItemCanceled(nftAddress, tokenId, msg.sender);
  }

  function updateListing(address nftAddress, uint256 tokenId, uint256 newPrice)  external 
  isOwner(nftAddress, tokenId, msg.sender)
  isListed(nftAddress, tokenId){

    s_listings[nftAddress][tokenId].price = newPrice;
    emit ItemListed(nftAddress, tokenId, msg.sender, newPrice);
  }


  function withdrawProceeds() external  {

    uint256 proceeds = s_proceeds[msg.sender];
    if (proceeds <= 0) {
        revert NftMarketplace__NoProceeds();
    }
    s_proceeds[msg.sender] = 0;
    (bool success, ) = payable(msg.sender).call{value: proceeds}("");
    if (!success) {
        revert NftMarketplace__TransferFailed();
    }
  }

    ////////////////////////
   ///  Main Functions  ///
  ////////////////////////

  function getListings(address nftAddress, uint256 tokenId)  external view returns (Listing memory) {
    return s_listings[nftAddress][tokenId];
  }

  function getProceeds(address seller) external view returns (uint256) {
    return s_proceeds[seller];
  }
}