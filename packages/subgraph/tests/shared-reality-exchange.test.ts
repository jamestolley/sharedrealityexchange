import { describe, test, assert, beforeAll, logStore, newMockEvent } from "matchstick-as";
import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { Campaign, Donation, Withdrawal } from "../generated/schema";
import { generateCampaignId, generateDonationId, generateWithdrawalId } from "../generated/UncrashableEntityHelpers";
import { 
  CampaignCreated as CampaignCreatedEvent,
  Donation as DonationEvent,
  Withdrawal as WithdrawalEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  CampaignOwnerUpdated as CampaignOwnerUpdatedEvent,
  CampaignTitleUpdated as CampaignTitleUpdatedEvent,
  CampaignClaimUpdated as CampaignClaimUpdatedEvent,
  CampaignDescriptionUpdated as CampaignDescriptionUpdatedEvent
} from "../generated/SharedRealityExchange/SharedRealityExchange";
import {
  createCampaignId,
  handleCampaignCreated,
  handleDonation,
  // handleOwnershipTransferred,
  handleWithdrawal,
  handleUpdateCampaignOwner,
  handleUpdateCampaignTitle,
  handleUpdateCampaignClaim,
  handleUpdateCampaignDescription
} from "../src/mapping";


describe("Shared Reality Exchange", () => {

  beforeAll(() => {

    let newCampaignEvent = createCampaignEvent(0, "0xd8da6bf26964af9d7eed9e03e53415d37aa96045", "title", "claim", "description")
    handleCampaignCreated(newCampaignEvent)

    let newDonationEvent = createDonationEvent(0, "0xd8da6bf26964af9d7eed9e03e53415d37aa96045", BigInt.fromU32(1000))
    handleDonation(newDonationEvent, '0x01')

    let newWithdrawalEvent = createWithdrawalEvent(0, "0xd8da6bf26964af9d7eed9e03e53415d37aa96045", BigInt.fromU32(100))
    handleWithdrawal(newWithdrawalEvent, '0x02')

    // let newTransferEvent = createTransferEvent("0xd8da6bf26964af9d7eed9e03e53415d37aa96045", "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266")
    // handleOwnershipTransferred(newTransferEvent, '0x03')

    // logStore();
  });

  test("Can create new campaign", () => {

    let campaignId = generateCampaignId(Bytes.fromHexString(createCampaignId(BigInt.fromI32(0))));

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
    // if (campaign) {
    //   assert.fieldEquals("Campaign", campaignId, "blockNumber", campaign.blockNumber.toString());
    //   assert.fieldEquals("Campaign", campaignId, "blockTimestamp", campaign.blockTimestamp.toString());
    //   assert.fieldEquals("Campaign", campaignId, "transactionHash", campaign.transactionHash.toString());
    // }

    assert.entityCount("Campaign", 1);
  });

  test("Donation", () => {

    // let donationEvent = createDonationEvent(0, "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", BigInt.fromU32(1000))

    let donationId = generateDonationId(Bytes.fromHexString('0x01'));

    let donation = Donation.load(donationId);
    assert.assertNotNull(
      donation,
      "Loaded Donation should not be null"
    );
    if (donation) {
      assert.fieldEquals("Donation", donation.id, "id", "0x01");
      assert.fieldEquals("Donation", donation.id, "campaignId", BigInt.fromI32(0).toString());
      assert.fieldEquals("Donation", donation.id, "donor", "0xd8da6bf26964af9d7eed9e03e53415d37aa96045");
      assert.fieldEquals("Donation", donation.id, "amount", BigInt.fromI32(1000).toString());
    }

    // if (donation) {
    //   assert.fieldEquals("Donation", donation.id, "blockNumber", BigInt.fromI32(234567).toString());
    //   assert.fieldEquals("Donation", donation.id, "blockTimestamp", BigInt.fromI32(123456787).toString());
    //   assert.fieldEquals("Donation", donation.id, "transactionHash", Bytes.fromHexString("0x1909fcb0b41989e28308afcb0cf55adb6faba28e14fcbf66c489c69b8fe95dd5").toString());
    // }

    assert.entityCount("Donation", 1);
  });

  test("Withdrawal", () => {

    // let donationEvent = createDonationEvent(0, "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", BigInt.fromU32(1000))

    let withdrawalId = generateWithdrawalId(Bytes.fromHexString('0x02'));

    let withdrawal = Withdrawal.load(withdrawalId);
    assert.assertNotNull(
      withdrawal,
      "Loaded Withdrawal should not be null"
    );
    if (withdrawal) {
      assert.fieldEquals("Withdrawal", withdrawal.id, "id", "0x02");
      assert.fieldEquals("Withdrawal", withdrawal.id, "campaignId", "0");
      assert.fieldEquals("Withdrawal", withdrawal.id, "withdrawer", "0xd8da6bf26964af9d7eed9e03e53415d37aa96045");
      assert.fieldEquals("Withdrawal", withdrawal.id, "amount", "100");
    }

    // if (withdrawal) {
    //   assert.fieldEquals("Donation", withdrawal.id, "blockNumber", BigInt.fromI32(234567).toString());
    //   assert.fieldEquals("Donation", withdrawal.id, "blockTimestamp", BigInt.fromI32(123456787).toString());
    //   assert.fieldEquals("Donation", withdrawal.id, "transactionHash", Bytes.fromHexString("0x1909fcb0b41989e28308afcb0cf55adb6faba28e14fcbf66c489c69b8fe95dd5").toString());
    // }

    assert.entityCount("Withdrawal", 1);
  });

  test("Can update a campaign", () => {

    let campaignId = generateCampaignId(Bytes.fromHexString(createCampaignId(BigInt.fromI32(0))));

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
export function createDonationEvent(campaignId: u32, donor: string, amount: BigInt): DonationEvent {
  // @ts-ignore
  let donationEvent = changetype<DonationEvent>(newMockEvent())
  donationEvent.parameters = new Array()

  let campaignIdParam = new ethereum.EventParam("campaignId", ethereum.Value.fromI32(campaignId))
  let donorParam = new ethereum.EventParam("donor", ethereum.Value.fromAddress(Address.fromString(donor)))
  let amountParam = new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))

  donationEvent.parameters.push(campaignIdParam)
  donationEvent.parameters.push(donorParam)
  donationEvent.parameters.push(amountParam)

  return donationEvent
}

// @ts-ignore
export function createWithdrawalEvent(campaignId: u32, withdrawer: string, amount: BigInt): WithdrawalEvent {
  // @ts-ignore
  let withdrawalEvent = changetype<WithdrawalEvent>(newMockEvent())
  withdrawalEvent.parameters = new Array()

  let campaignIdParam = new ethereum.EventParam("campaignId", ethereum.Value.fromI32(campaignId))
  let withdrawerParam = new ethereum.EventParam("withdrawer", ethereum.Value.fromAddress(Address.fromString(withdrawer)))
  let amountParam = new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))

  withdrawalEvent.parameters.push(campaignIdParam)
  withdrawalEvent.parameters.push(withdrawerParam)
  withdrawalEvent.parameters.push(amountParam)

  return withdrawalEvent
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