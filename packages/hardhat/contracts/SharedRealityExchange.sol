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

	/**
	 * @dev ConversationTree storage
	 * adding an argument map to a fund run
	 * aside from the below, each ConversationTree requires a treeRoot (an ideaId) and a mapping(bytes32 => Idea) public ideas;
	 */
	enum IdeaType {
		Claim, // just for claims
		Pro,
		Con,
		Part
	}

	Campaign[] public campaigns;
	mapping(address => DonorHistory) public donations;

	// just to make unique ideaIds in my tests
	uint32 ideaNonce;
	
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
		uint256 amount,
		string comment
	);
	
	event Withdrawal(
		uint32 campaignId,
		address withdrawer,
		uint256 amount,
		string comment
	);

	event Follow(
		uint32 campaignId,
		address user
	);

	event Unfollow(
		uint32 campaignId,
		address user
	);

	event CampaignUpdate(
		uint32 campaignId,
		address author,
		string title,
		string content
	);
	
    // if a parent idea exists, appends the child to the parent idea's children array
    // then sets this entity's parentIndex
	event CreateIdea(
		uint32 nonce,
		uint32 campaignId,
		string parentId,
		IdeaType ideaType,
		string text
	);

    // edits the old parent, some of the old parent's other children, and the new parent
	event UpdateIdeaParent(
		uint32 campaignId,
		string ideaId,
		string parentId
	);

	// just edits the one entity in the graph database
	event UpdateIdeaText(
		uint32 campaignId,
		string ideaId,
		string text
	);

	// just edits the one entity in the graph database
	event UpdateIdeaType(
		uint32 campaignId,
		string ideaId,
		IdeaType ideaType
	);
    
	// would fail if any children exist
	event DeleteIdea(
		uint32 campaignId,
		string ideaId
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

		// string memory parentId = "0x0000000000000000000000000000000000000000";
		// createIdea(campaignId, parentId, IdeaType.Claim, _claim);

		ideaNonce = 0;

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

	function donateToCampaign(uint32 _campaignId, string calldata _comment) public payable {

		require(bytes(_comment).length < 256, "The comment is longer than 256 bytes");

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

		emit Donation(_campaignId, msg.sender, msg.value, _comment);
	}

	function withdrawFromCampaign(uint32 _campaignId, uint256 _amountRequested, string calldata _comment) external nonReentrant {

		require(bytes(_comment).length < 256, "The comment is longer than 256 bytes");

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
		emit Withdrawal(_campaignId, msg.sender, _amountRequested, _comment);
	}

	function follow(uint32 _campaignId) external {
		emit Follow(_campaignId, msg.sender);
	}

	function unfollow(uint32 _campaignId) external {
		emit Unfollow(_campaignId, msg.sender);
	}

	function createCampaignUpdate(uint32 _campaignId, string calldata _title, string calldata _content) external {

		require(campaigns.length > _campaignId, "Campaign not found");

		Campaign storage campaign = campaigns[_campaignId];

		require(msg.sender == campaign.owner, "Caller is not the current owner");

		emit CampaignUpdate(_campaignId, campaign.owner, _title, _content);
	}

	function createIdea(uint32 _campaignId, string memory _parentId, IdeaType _ideaType, string calldata _text) public {
		
		require(campaigns.length > _campaignId, "Campaign not found");

		// this is not the claim, so it cannot be of IdeaType.Claim
		require(_ideaType >= IdeaType.Claim && _ideaType <= IdeaType.Part, "ideaType must be 0, 1, 2, or 3");

		// _text cannot be empty
		bytes32 baseCompare = keccak256("");
		bytes32 textCompare = keccak256(bytes(_text));
		require(baseCompare != textCompare, "Idea text cannot be empty");

		Campaign storage campaign = campaigns[_campaignId];

		require(msg.sender == campaign.owner, "Caller is not the current owner");

		emit CreateIdea(ideaNonce, _campaignId, _parentId, _ideaType, _text);
		
		ideaNonce = ideaNonce + 1;
	}

	function updateIdeaParent(uint32 _campaignId, string calldata _ideaId, string calldata _parentId) public {

		require(campaigns.length > _campaignId, "Campaign not found");

		Campaign storage campaign = campaigns[_campaignId];

		require(msg.sender == campaign.owner, "Caller is not the current owner");

		emit UpdateIdeaParent(_campaignId, _ideaId, _parentId);
	}

	function updateIdeaType(uint32 _campaignId, string calldata _ideaId, IdeaType _ideaType) public {

		require(campaigns.length > _campaignId, "Campaign not found");

		// this is not the claim, so it cannot be of IdeaType.Claim
		require(_ideaType != IdeaType.Claim, "ideaType must be 1, 2, or 3");

		Campaign storage campaign = campaigns[_campaignId];

		require(msg.sender == campaign.owner, "Caller is not the current owner");

		emit UpdateIdeaType(_campaignId, _ideaId, _ideaType);
	}

	function updateIdeaText(uint32 _campaignId, string calldata _ideaId, string calldata _text) public {

		require(campaigns.length > _campaignId, "Campaign not found");

		// _text cannot be empty
		bytes32 baseCompare = keccak256("");
		bytes32 textCompare = keccak256(bytes(_text));
		require(baseCompare != textCompare, "Idea text cannot be empty");

		Campaign storage campaign = campaigns[_campaignId];

		require(msg.sender == campaign.owner, "Caller is not the current owner");

		emit UpdateIdeaText(_campaignId, _ideaId, _text);
	}

	function deleteIdea(uint32 _campaignId, string calldata _ideaId) public {

		require(campaigns.length > _campaignId, "Campaign not found");

		Campaign storage campaign = campaigns[_campaignId];

		require(msg.sender == campaign.owner, "Caller is not the current owner");

		emit DeleteIdea(_campaignId, _ideaId);
	}

}
