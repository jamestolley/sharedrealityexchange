//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";

// Use openzeppelin to inherit battle-tested implementations (ERC20, ERC721, etc)
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * A smart contract that allows changing a state variable of the contract and tracking the changes
 * It also allows the owner to withdraw the Ether in the contract
 * @author BuidlGuidl
 */
contract SharedRealityExchange is Ownable, ReentrancyGuard {

	struct Campaign {
		address owner;
		string title;
		string claim;
		uint256 amountCollected;
		uint256 amountWithdrawn;
	}

	struct DonorHistory {
		address donor;
		mapping(uint256 => uint256) donationToCampaign; //mapping(fundRunId => donationAmount)
	}

	Campaign[] public campaigns;
	mapping(address => DonorHistory) public donations;
	
	event CampaignCreated(
		uint32 campaignId,
		address owner,
		string title,
		string claim,
		string description
	);

	event CampaignOwnerUpdated(
		uint32 campaignId,
		address owner
	);

	event CampaignTitleUpdated(
		uint32 campaignId,
		string title
	);

	event CampaignClaimUpdated(
		uint32 campaignId,
		string claim
	);

	event CampaignDescriptionUpdated(
		uint32 campaignId,
		string description
	);

	event Donation(
		uint32 campaignId,
		address donor,
		uint256 amount
	);
	
	event Withdrawal(
		uint32 campaignId,
		address withdrawer,
		uint256 amount
	);

	event Follow(
		uint32 campaignId,
		address user
	);

	event Unfollow(
		uint32 campaignId,
		address user
	);

	constructor() Ownable() {}

	function createCampaign(
		string calldata _title,
		string calldata _claim,
		string calldata _description
	) external returns (uint32) {

		bytes32 baseCompare = keccak256("");
		bytes32 titleCompare = keccak256(bytes(_title));
		bytes32 claimCompare = keccak256(bytes(_claim));
		bytes32 descriptionCompare = keccak256(bytes(_description));
		require(
			titleCompare != baseCompare && claimCompare != baseCompare && descriptionCompare != baseCompare,
			"Title, Claim and Description are all required fields."
		);

		require(bytes(_title).length < 256, "The title is longer than 256 bytes");
		require(bytes(_claim).length < 256, "The claim is longer than 256 bytes");
		require(bytes(_description).length < 65536, "The description is longer than 65536 bytes");

		campaigns.push(Campaign({
			owner: msg.sender,
			title: _title,
			claim: _claim,
			amountCollected: 0,
			amountWithdrawn: 0
		}));
		uint32 campaignId = uint32(campaigns.length - 1);

		emit CampaignCreated(campaignId, msg.sender, _title, _claim, _description);

		return campaignId;
	}

	function updateCampaignOwner(uint32 _campaignId, address _newOwner) public {

		require(campaigns.length > _campaignId, "Campaign not found");

		Campaign storage campaign = campaigns[_campaignId];

		require(msg.sender == campaign.owner, "Caller is not the current owner");

		campaign.owner = _newOwner;

		emit CampaignOwnerUpdated(_campaignId, campaign.owner);
	}

	function updateCampaignTitle(uint32 _campaignId, string calldata _newTitle) public {

		require(bytes(_newTitle).length < 256, "The title is longer than 256 bytes");
		require(campaigns.length > _campaignId, "Campaign not found");

		Campaign storage campaign = campaigns[_campaignId];

		require(msg.sender == campaign.owner, "Caller is not the current owner");

		campaign.title = _newTitle;

		emit CampaignTitleUpdated(_campaignId, campaign.title);
	}

	function updateCampaignClaim(uint32 _campaignId, string calldata _newClaim) public {

		require(bytes(_newClaim).length < 256, "The claim is longer than 256 bytes");
		require(campaigns.length > _campaignId, "Campaign not found");

		Campaign storage campaign = campaigns[_campaignId];

		require(msg.sender == campaign.owner, "Caller is not the current owner");

		campaign.claim = _newClaim;

		emit CampaignClaimUpdated(_campaignId, campaign.claim);
	}

	function updateCampaignDescription(uint32 _campaignId, string calldata _newDescription) public {

		require(bytes(_newDescription).length < 65536, "The description is longer than 65536 bytes");
		require(campaigns.length > _campaignId, "Campaign not found");

		Campaign storage campaign = campaigns[_campaignId];

		require(msg.sender == campaign.owner, "Caller is not the current owner");

		emit CampaignDescriptionUpdated(_campaignId, _newDescription);
	}

	function campaignCount() public view returns (uint256 count) {
		count = campaigns.length;
	}

	function donateToCampaign(uint32 _campaignId) public payable {
		require(campaigns.length >= _campaignId + 1, "No such campaign");
		require(msg.value > 0, "Minimum payment amount not met.");

		/**
		 * @dev next few lines are how a person can donate to multiple fund runs (multiple times)
		 * while still keeping the donations logged separately for proper withdrawal
		 * Donor's Address _> Donor Log _> mapping(fundRunID => donationAmount)
		 */
		DonorHistory storage donorHistory = donations[msg.sender];

		if (donorHistory.donor != msg.sender) donorHistory.donor = msg.sender;

		uint256 previousCampaignDonation = donorHistory.donationToCampaign[_campaignId];

		donorHistory.donationToCampaign[_campaignId] = msg.value + previousCampaignDonation;

		uint256 newAmountCollected = campaigns[_campaignId].amountCollected + msg.value;

		campaigns[_campaignId].amountCollected = newAmountCollected;

		emit Donation(_campaignId, msg.sender, msg.value);
	}

	function withdrawFromCampaign(uint32 _campaignId, uint256 _amountRequested) external nonReentrant {

		// find the total available for withdrawl
		Campaign storage campaign = campaigns[_campaignId];

		require(msg.sender == campaign.owner, "Caller is not the owner");

		uint256 amountAvailable = campaign.amountCollected - campaign.amountWithdrawn;

		// make sure it is less than the amount requested
		require(_amountRequested <= amountAvailable, "Insufficient funds");

		// update the campaign's total amountWithdrawn
		uint256 newTotalWithdrawn = campaign.amountWithdrawn + _amountRequested;
		campaign.amountWithdrawn = newTotalWithdrawn;

		// send the funds to the owner (msg.sender)
		(bool success, ) = payable(msg.sender).call{ value: _amountRequested }("");

		// make sure the send happened
		require(success, "Withdrawal unsuccessful");

		// record the withdrawl
		emit Withdrawal(_campaignId, msg.sender, _amountRequested);
	}

	function follow(uint32 _campaignId) external {
		emit Follow(_campaignId, msg.sender);
	}

	function unfollow(uint32 _campaignId) external {
		emit Unfollow(_campaignId, msg.sender);
	}

}
