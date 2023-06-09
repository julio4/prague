// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// Import this file to use console.log
import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

struct Offer {
    bytes32 hash1;
    bytes32 hash2;
    uint256 value;
    address offerer;
    bool active;
}

struct Rating {
    uint256 totalRating;
    uint256 numberOfRatings;
}

contract Sel is ERC20 {
  address private owner;

  constructor(uint256 _mintValue) ERC20("Sel", "SEL") {
    _mint(msg.sender, _mintValue * 10 ** decimals());
    owner = msg.sender;
  }

  modifier onlyOwner() {
    require(msg.sender == owner, "Only the owner can call this function");
    _;
  }

  uint256 public latestOfferId;
  mapping(uint256 => Offer) private offers;
  mapping(address => uint256) private proposers;

  mapping(address => uint256) private _stack;

  mapping(address => uint256) private _userActivities;
  mapping(address => mapping(address => bool)) private _boostedInteractionUsed;

  mapping(address => Rating) private _ratings;
  mapping(address => mapping(address => uint256)) private _interactionCredit;

  uint256 constant private inflationBuyerDiscount = 25;
  uint256 constant private inflationSellerBonus = 35;

  // See doc to understand mathematic formula chosen
  uint256[] private _taxConstants = [50, 110, 155, 185];

  event OfferCreated(uint256 offerId, address offerer, uint256 tokens, bytes32[2] hash);
  event OfferCanceled(uint256 offerId, address offerer);
  event PropositionMade(uint256 offerId, address proposer, uint256 tokens, bytes32[2] hash);
  event PropositionCanceled(uint256 offerId, address proposer);
  event PropositionAccepted(uint256 offerId, address offerer, address requester, uint256 tokens, bytes32[2] hash);
  event InteractionsReset(uint256 newVersion);
  event UserRated(address indexed rater, address indexed ratee, uint256 rating);


  modifier offerExistance(uint256 _offerId) {
    Offer memory offer = offers[_offerId];

    require(offer.offerer != address(0), "Offer does not exist");
    require(offer.active, "Offer is not active");
    _;
  }

  function getOffer(uint256 _offer) public view returns (bytes32[2] memory, uint256, address, bool) {
    Offer storage offer = offers[_offer];
    return ([offer.hash1, offer.hash2], offer.value, offer.offerer, offer.active);
  }

  function getStackedBalance(address _address) public view returns (uint256) {
    return _stack[_address];
  }

  function getProposition(address _address) public view returns (uint256) {
    return proposers[_address];
  }

  function _applyTaxIfNecessary(address user) internal {
    uint256 weekInactives = _userActivities[user]++;  // = inactives + 1
    if (_userActivities[user] > 1) {
      uint256 tax = _taxConstants[weekInactives - 1] / 100 * balanceOf(user);
      _burn(user, tax);
    }
  }

  function rateUser(address _ratee, uint256 _rating) public {
    require(_interactionCredit[msg.sender][_ratee] > 0, "You do not have interaction credit for this user");
    require(_rating <= 5 && _rating >= 1, "Rating must be between 1 and 5");
    
    Rating storage rating = _ratings[_ratee];
    rating.totalRating += _rating;
    rating.numberOfRatings += 1;

    // reset the interaction credit
    _interactionCredit[msg.sender][_ratee]--;
    
    emit UserRated(msg.sender, _ratee, _rating);
}

  function transfer(address recipient, uint256 amount) public override returns (bool) {
    _applyTaxIfNecessary(msg.sender);
    require(msg.sender == address(this), "Direct transfers not allowed");
    return super.transfer(recipient, amount);
  }

  function transferFrom(address sender, address recipient, uint256 amount) public override returns (bool) {
    _applyTaxIfNecessary(sender);
    require(msg.sender == address(this), "Indirect transfers not allowed");
    return super.transferFrom(sender, recipient, amount);
  }

  function createOffer(uint256 _tokens, bytes32[2] memory _hash) public payable{
    require(_tokens > 0, "You must offer at least 1 token"); // TODO : Delete this part
    _applyTaxIfNecessary(msg.sender);
    _transfer(msg.sender, address(this), _tokens);

    latestOfferId++;
    offers[latestOfferId] = Offer(_hash[0], _hash[1], _tokens, msg.sender, true);
    _stack[msg.sender] += _tokens;

    emit OfferCreated(latestOfferId, msg.sender, _tokens, _hash);
  }

  function cancelOffer(uint256 _offerId) offerExistance(_offerId) public payable {
    Offer memory offer = offers[_offerId];
    require(offer.offerer == msg.sender, "You are not the offerer");

    delete offers[_offerId];
    _stack[msg.sender] -= offer.value;
    emit OfferCanceled(_offerId, msg.sender);
    _transfer(address(this), msg.sender, offer.value);
  }

  function makeProposition(uint256 _offerId) offerExistance(_offerId) public payable {
    Offer memory offer = offers[_offerId];

    require(offer.offerer != msg.sender, "You can't request your own offer");

    proposers[msg.sender] = _offerId;

    emit PropositionMade(_offerId, msg.sender, offer.value, [offer.hash1, offer.hash2]);
  }

  function cancelProposition() public payable {
    uint256 _offerId = proposers[msg.sender];
    require(_offerId != 0, "You are not a proposer");

    delete proposers[msg.sender];
    emit PropositionCanceled(_offerId, msg.sender);
  }

  function acceptOffer(uint256 _offerId, address proposer) offerExistance(_offerId) public payable {
    _applyTaxIfNecessary(msg.sender);
    Offer storage offer = offers[_offerId];

    require(offer.offerer == msg.sender, "You are not the offerer");
    require(proposers[proposer] == _offerId, "The provided address is not a proposer");

    offer.active = false;
    emit PropositionAccepted(_offerId, offer.offerer, proposer, offer.value, [offer.hash1, offer.hash2]);

    _stack[offer.offerer] -= offer.value;
    
    if (!_boostedInteractionUsed[msg.sender][proposer]) {
          uint256 buyerAmount = offer.value * (100 - inflationBuyerDiscount) / 100;
          uint256 sellerAmount = offer.value * (100 + inflationSellerBonus) / 100;
          _transfer(address(this), proposer, buyerAmount);
          _mint(offer.offerer, sellerAmount);
          _boostedInteractionUsed[msg.sender][proposer] = false;
      } else {
        _transfer(address(this), proposer, offer.value);
    }

    _interactionCredit[msg.sender][proposer]++;
    _interactionCredit[proposer][msg.sender]++;

    delete proposers[proposer];

    _userActivities[msg.sender] = 0;
    _userActivities[proposer] = 0;
  }


    function resetInteractions() public onlyOwner {
    for (uint256 i = 1; i <= latestOfferId; i++) {
      Offer memory offer = offers[i];
      _boostedInteractionUsed[offer.offerer][msg.sender] = false;
    }

    emit InteractionsReset(latestOfferId);
  }

  function getFreeTokens(uint256 _freeTokens) public {
    _mint(msg.sender, _freeTokens * 10 ** decimals());
  }

  function getRating(address _user) public view returns (uint256) {
    Rating memory rating = _ratings[_user];
    if(rating.numberOfRatings == 0) {
        return 0;
    }
    return rating.totalRating / rating.numberOfRatings;
}
}
