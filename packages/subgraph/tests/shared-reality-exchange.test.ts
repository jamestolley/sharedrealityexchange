import { describe, test, assert, beforeAll, logStore, newMockEvent } from "matchstick-as";
import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { Campaign, Donation, Withdrawal } from "../generated/schema";
import { generateCampaignId, generateDonationId, generateWithdrawalId } from "../generated/UncrashableEntityHelpers";
import { 
  CampaignCreated as CampaignCreatedEvent,
  Donation as DonationEvent,
  Withdrawal as WithdrawalEvent,
  CampaignUpdate as CampaignUpdateEvent,
  CampaignOwnerUpdated as CampaignOwnerUpdatedEvent,
  CampaignTitleUpdated as CampaignTitleUpdatedEvent,
  CampaignClaimUpdated as CampaignClaimUpdatedEvent,
  CampaignDescriptionUpdated as CampaignDescriptionUpdatedEvent,
  Follow as FollowEvent,
  Unfollow as UnfollowEvent,
} from "../generated/SharedRealityExchange/SharedRealityExchange";
import {
  handleCampaignCreated,
  handleDonation,
  handleWithdrawal,
  handleUpdateCampaignOwner,
  handleUpdateCampaignTitle,
  handleUpdateCampaignClaim,
  handleUpdateCampaignDescription,
  getCampaignId,
  handleFollow,
  handleUnfollow,
  handleCampaignUpdate
} from "../src/mapping";

/**
 * TODO: add tests for Donors and Withdrawers (including derived fields), and for the deterministic ids of Donations and Withdrawals
 */

describe("Shared Reality Exchange", () => {

  beforeAll(() => {

    let newCampaignEvent = createCampaignEvent(0, "0xd8da6bf26964af9d7eed9e03e53415d37aa96045", "title", "claim", "description")
    handleCampaignCreated(newCampaignEvent)

    let newDonationEvent = createDonationEvent(0, "0xd8da6bf26964af9d7eed9e03e53415d37aa96045", BigInt.fromU32(1000), "This is the donation comment")
    handleDonation(newDonationEvent)

    let newWithdrawalEvent = createWithdrawalEvent(0, "0xd8da6bf26964af9d7eed9e03e53415d37aa96045", BigInt.fromU32(100), "This is the withdrawal comment")
    handleWithdrawal(newWithdrawalEvent)

    let newFollowEvent = createFollowEvent(0, "0xd8da6bf26964af9d7eed9e03e53415d37aa96045")
    handleFollow(newFollowEvent)

    let newCampaignUpdateEvent = createCampaignUpdateEvent(0, "0xd8da6bf26964af9d7eed9e03e53415d37aa96045", "title", "content")
    handleCampaignUpdate(newCampaignUpdateEvent)

    // let newTransferEvent = createTransferEvent("0xd8da6bf26964af9d7eed9e03e53415d37aa96045", "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266")
    // handleOwnershipTransferred(newTransferEvent, '0x03')

    logStore();
  });

  test("Can create new campaign", () => {

    let campaignId = getCampaignId(0);

    let campaign = Campaign.load(campaignId);
    assert.assertNotNull(
        campaign,
        "Loaded Campaign should not be null"
    );

    assert.fieldEquals("Campaign", campaignId, "id", "0x00");
    assert.fieldEquals("Campaign", campaignId, "campaignId", "0");
    assert.fieldEquals("Campaign", campaignId, "owner", "0xd8da6bf26964af9d7eed9e03e53415d37aa96045");
    assert.fieldEquals("Campaign", campaignId, "title", "title");
    assert.fieldEquals("Campaign", campaignId, "claim", "claim");
    assert.fieldEquals("Campaign", campaignId, "description", "description");

    assert.entityCount("Campaign", 1);
  });

  test("Donation", () => {

    let campaignId = getCampaignId(0);

    let campaign = Campaign.load(campaignId);
    assert.assertNotNull(
        campaign,
        "Loaded Campaign should not be null"
    );

    let donations = campaign!.donations.load();
    let donation = donations[0];
    assert.assertNotNull(
      donation,
      "Loaded Donation should not be null"
    );
    if (donation) {
      assert.fieldEquals("Donation", donation.id, "campaign", campaignId);
      assert.fieldEquals("Donation", donation.id, "donor", "0xd8da6bf26964af9d7eed9e03e53415d37aa96045");
      assert.fieldEquals("Donation", donation.id, "amount", BigInt.fromI32(1000).toString());
      assert.fieldEquals("Donation", donation.id, "comment", "This is the donation comment");
    }

    assert.entityCount("Donation", 1);
  });

  test("Withdrawal", () => {

    let campaignId = getCampaignId(0);

    let campaign = Campaign.load(campaignId);
    assert.assertNotNull(
        campaign,
        "Loaded Campaign should not be null"
    );

    let withdrawals = campaign!.withdrawals.load();
    let withdrawal = withdrawals[0];
    assert.assertNotNull(
      withdrawal,
      "Loaded Withdrawal should not be null"
    );
    if (withdrawal) {
      assert.fieldEquals("Withdrawal", withdrawal.id, "campaign", campaignId);
      assert.fieldEquals("Withdrawal", withdrawal.id, "withdrawer", "0xd8da6bf26964af9d7eed9e03e53415d37aa96045");
      assert.fieldEquals("Withdrawal", withdrawal.id, "amount", "100");
      assert.fieldEquals("Withdrawal", withdrawal.id, "comment", "This is the withdrawal comment");
    }

    assert.entityCount("Withdrawal", 1);
  });

  test("CampaignUpdate", () => {

    let campaignId = getCampaignId(0);

    let campaign = Campaign.load(campaignId);
    assert.assertNotNull(
        campaign,
        "Loaded Campaign should not be null"
    );

    let updates = campaign!.updates.load();
    let update = updates[0];
    assert.assertNotNull(
      update,
      "Loaded CampaignUpdate should not be null"
    );
    if (update) {
      assert.fieldEquals("CampaignUpdate", update.id, "campaign", campaignId);
      assert.fieldEquals("CampaignUpdate", update.id, "author", "0xd8da6bf26964af9d7eed9e03e53415d37aa96045");
      assert.fieldEquals("CampaignUpdate", update.id, "title", "title");
      assert.fieldEquals("CampaignUpdate", update.id, "content", "content");
    }

    assert.entityCount("CampaignUpdate", 1);
  });

  test("Follow", () => {

    let campaignId = getCampaignId(0);

    let campaign = Campaign.load(campaignId);
    assert.assertNotNull(
        campaign,
        "Loaded Campaign should not be null"
    );

    let follows = campaign!.follows.load();
    let follow = follows[0];
    assert.assertNotNull(
      follow,
      "Loaded Follow should not be null"
    );
    if (follow) {
      assert.fieldEquals("Follow", follow.id, "campaign", campaignId);
      assert.fieldEquals("Follow", follow.id, "user", "0xd8da6bf26964af9d7eed9e03e53415d37aa96045");
    }

    assert.entityCount("Follow", 1);
  });

  test("Unfollow", () => {

    let newUnfollowEvent = createUnfollowEvent(0, "0xd8da6bf26964af9d7eed9e03e53415d37aa96045")
    handleUnfollow(newUnfollowEvent)

    let campaignId = getCampaignId(0);

    let campaign = Campaign.load(campaignId);
    assert.assertNotNull(
        campaign,
        "Loaded Campaign should not be null"
    );

    let follows = campaign!.follows.load();
    assert.equals(
      ethereum.Value.fromI32(follows.length),
      ethereum.Value.fromI32(0)
    );

    assert.entityCount("Follow", 0);
  });

  test("Can update a campaign", () => {

    let campaignId = getCampaignId(0);

    let updateOwnerEvent = createUpdateOwnerEvent(0, "0xd8da6bf26964af9d7eed9e03e53415d37aa96045")
    handleUpdateCampaignOwner(updateOwnerEvent)

    let updateTitleEvent = createUpdateTitleEvent(0, "new title!")
    handleUpdateCampaignTitle(updateTitleEvent)

    let updateClaimEvent = createUpdateClaimEvent(0, "new claim!")
    handleUpdateCampaignClaim(updateClaimEvent)

    let updateDescriptionEvent = createUpdateDescriptionEvent(0, "new description!")
    handleUpdateCampaignDescription(updateDescriptionEvent)

    let campaign = Campaign.load(campaignId);
    assert.assertNotNull(
        campaign,
        "Loaded Campaign should not be null"
    );

    assert.fieldEquals("Campaign", campaignId, "id", "0x00");
    assert.fieldEquals("Campaign", campaignId, "campaignId", "0");
    assert.fieldEquals("Campaign", campaignId, "owner", "0xd8da6bf26964af9d7eed9e03e53415d37aa96045");
    assert.fieldEquals("Campaign", campaignId, "title", "new title!");
    assert.fieldEquals("Campaign", campaignId, "claim", "new claim!");
    assert.fieldEquals("Campaign", campaignId, "description", "new description!");

    assert.entityCount("Campaign", 1);
  });
});

// @ts-ignore
export function createCampaignEvent(campaignId: u32, owner: string, title: string, claim: string, description: string): CampaignCreatedEvent {
  // @ts-ignore
  let campaignCreatedEvent = changetype<CampaignCreatedEvent>(newMockEvent())
  campaignCreatedEvent.parameters = new Array()

  let idParam = new ethereum.EventParam("campaignId", ethereum.Value.fromI32(campaignId))
  let ownerParam = new ethereum.EventParam("owner", ethereum.Value.fromAddress(Address.fromString(owner)))
  let titleParam = new ethereum.EventParam("title", ethereum.Value.fromString(title))
  let claimParam = new ethereum.EventParam("claim", ethereum.Value.fromString(claim))
  let descriptionParam = new ethereum.EventParam("description", ethereum.Value.fromString(description))

  campaignCreatedEvent.parameters.push(idParam)
  campaignCreatedEvent.parameters.push(ownerParam)
  campaignCreatedEvent.parameters.push(titleParam)
  campaignCreatedEvent.parameters.push(claimParam)
  campaignCreatedEvent.parameters.push(descriptionParam)

  return campaignCreatedEvent
}

// @ts-ignore
export function createDonationEvent(campaignId: u32, donor: string, amount: BigInt, comment: string): DonationEvent {
  // @ts-ignore
  let donationEvent = changetype<DonationEvent>(newMockEvent())
  donationEvent.parameters = new Array()

  // let theCampaignId = getCampaignId(campaignId)
  let campaignIdParam = new ethereum.EventParam("campaignId", ethereum.Value.fromI32(campaignId))
  let donorParam = new ethereum.EventParam("donor", ethereum.Value.fromAddress(Address.fromString(donor)))
  let amountParam = new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  let commentParam = new ethereum.EventParam("comment", ethereum.Value.fromString(comment))

  donationEvent.parameters.push(campaignIdParam)
  donationEvent.parameters.push(donorParam)
  donationEvent.parameters.push(amountParam)
  donationEvent.parameters.push(commentParam)

  return donationEvent
}

// @ts-ignore
export function createWithdrawalEvent(campaignId: u32, withdrawer: string, amount: BigInt, comment: string): WithdrawalEvent {
  // @ts-ignore
  let withdrawalEvent = changetype<WithdrawalEvent>(newMockEvent())
  withdrawalEvent.parameters = new Array()

  // let theCampaignId = getCampaignId(campaignId)
  let campaignIdParam = new ethereum.EventParam("campaignId", ethereum.Value.fromI32(campaignId))
  let withdrawerParam = new ethereum.EventParam("withdrawer", ethereum.Value.fromAddress(Address.fromString(withdrawer)))
  let amountParam = new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  let commentParam = new ethereum.EventParam("comment", ethereum.Value.fromString(comment))

  withdrawalEvent.parameters.push(campaignIdParam)
  withdrawalEvent.parameters.push(withdrawerParam)
  withdrawalEvent.parameters.push(amountParam)
  withdrawalEvent.parameters.push(commentParam)

  return withdrawalEvent
}

// @ts-ignore
export function createFollowEvent(campaignId: u32, user: string): FollowEvent {
  // @ts-ignore
  let followEvent = changetype<FollowEvent>(newMockEvent())
  followEvent.parameters = new Array()

  // let theCampaignId = getCampaignId(campaignId)
  let campaignIdParam = new ethereum.EventParam("campaignId", ethereum.Value.fromI32(campaignId))
  let userParam = new ethereum.EventParam("user", ethereum.Value.fromAddress(Address.fromString(user)))

  followEvent.parameters.push(campaignIdParam)
  followEvent.parameters.push(userParam)

  return followEvent
}

// @ts-ignore
export function createUnfollowEvent(campaignId: u32, user: string): UnfollowEvent {
  // @ts-ignore
  let unfollowEvent = changetype<UnfollowEvent>(newMockEvent())
  unfollowEvent.parameters = new Array()

  // let theCampaignId = getCampaignId(campaignId)
  let campaignIdParam = new ethereum.EventParam("campaignId", ethereum.Value.fromI32(campaignId))
  let userParam = new ethereum.EventParam("user", ethereum.Value.fromAddress(Address.fromString(user)))

  unfollowEvent.parameters.push(campaignIdParam)
  unfollowEvent.parameters.push(userParam)

  return unfollowEvent
}

// @ts-ignore
export function createCampaignUpdateEvent(campaignId: u32, author: string, title: string, content: string): CampaignUpdateEvent {
  // @ts-ignore
  let campaignUpdateEvent = changetype<CampaignUpdateEvent>(newMockEvent())
  campaignUpdateEvent.parameters = new Array()

  // let theCampaignId = getCampaignId(campaignId)
  let campaignIdParam = new ethereum.EventParam("campaignId", ethereum.Value.fromI32(campaignId))
  let authorParam = new ethereum.EventParam("author", ethereum.Value.fromAddress(Address.fromString(author)))
  let titleParam = new ethereum.EventParam("title", ethereum.Value.fromString(title))
  let contentParam = new ethereum.EventParam("content", ethereum.Value.fromString(content))

  campaignUpdateEvent.parameters.push(campaignIdParam)
  campaignUpdateEvent.parameters.push(authorParam)
  campaignUpdateEvent.parameters.push(titleParam)
  campaignUpdateEvent.parameters.push(contentParam)

  return campaignUpdateEvent
}

// @ts-ignore
export function createUpdateOwnerEvent(campaignId: u32, newOwner: string): CampaignOwnerUpdatedEvent {
  let updateOwnerEvent = changetype<CampaignOwnerUpdatedEvent>(newMockEvent())
  updateOwnerEvent.parameters = new Array()

  let campaignIdParam = new ethereum.EventParam("campaignId", ethereum.Value.fromI32(campaignId))
  let newOwnerParam = new ethereum.EventParam("withdrawer", ethereum.Value.fromAddress(Address.fromString(newOwner)))

  updateOwnerEvent.parameters.push(campaignIdParam)
  updateOwnerEvent.parameters.push(newOwnerParam)

  return updateOwnerEvent
}

// @ts-ignore
export function createUpdateTitleEvent(campaignId: u32, newTitle: string): CampaignTitleUpdatedEvent {
  let updateTitleEvent = changetype<CampaignTitleUpdatedEvent>(newMockEvent())
  updateTitleEvent.parameters = new Array()

  let campaignIdParam = new ethereum.EventParam("campaignId", ethereum.Value.fromI32(campaignId))
  let newTitleParam = new ethereum.EventParam("withdrawer", ethereum.Value.fromString(newTitle))

  updateTitleEvent.parameters.push(campaignIdParam)
  updateTitleEvent.parameters.push(newTitleParam)

  return updateTitleEvent
}

// @ts-ignore
export function createUpdateClaimEvent(campaignId: u32, newClaim: string): CampaignClaimUpdatedEvent {
  let updateClaimEvent = changetype<CampaignClaimUpdatedEvent>(newMockEvent())
  updateClaimEvent.parameters = new Array()

  let campaignIdParam = new ethereum.EventParam("campaignId", ethereum.Value.fromI32(campaignId))
  let newTitleParam = new ethereum.EventParam("withdrawer", ethereum.Value.fromString(newClaim))

  updateClaimEvent.parameters.push(campaignIdParam)
  updateClaimEvent.parameters.push(newTitleParam)

  return updateClaimEvent
}

// @ts-ignore
export function createUpdateDescriptionEvent(campaignId: u32, newDescription: string): CampaignDescriptionUpdatedEvent {
  let updateDescriptionEvent = changetype<CampaignDescriptionUpdatedEvent>(newMockEvent())
  updateDescriptionEvent.parameters = new Array()

  let campaignIdParam = new ethereum.EventParam("campaignId", ethereum.Value.fromI32(campaignId))
  let newDescriptionParam = new ethereum.EventParam("withdrawer", ethereum.Value.fromString(newDescription))

  updateDescriptionEvent.parameters.push(campaignIdParam)
  updateDescriptionEvent.parameters.push(newDescriptionParam)

  return updateDescriptionEvent
}
