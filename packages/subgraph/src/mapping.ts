import { Bytes, BigInt, store } from "@graphprotocol/graph-ts";
import {
  YourContract,
  GreetingChange,
} from "../generated/YourContract/YourContract";
import { 
  CampaignCreated as CampaignCreatedEvent,
  Donation as DonationEvent,
  Withdrawal as WithdrawalEvent,
  CampaignOwnerUpdated as CampaignOwnerUpdatedEvent,
  CampaignTitleUpdated as CampaignTitleUpdatedEvent,
  CampaignClaimUpdated as CampaignClaimUpdatedEvent,
  CampaignDescriptionUpdated as CampaignDescriptionUpdatedEvent,
  Follow as FollowEvent,
  Unfollow as UnfollowEvent
} from "../generated/SharedRealityExchange/SharedRealityExchange";
import { Greeting, Sender } from "../generated/schema";
import {
  generateCampaignId,
  generateDonorId,
  generateWithdrawerId,
  getOrInitializeDonor,
  getOrInitializeWithdrawer,
  createCampaign,
  getCampaign,
  createDonation,
  generateDonationId,
  generateWithdrawalId,
  createWithdrawal,
  updateCampaignOwner,
  updateCampaignTitle,
  updateCampaignClaim,
  updateCampaignDescription,
  getDonor,
  getWithdrawer,
  createFollow,
  generateFollowId
} from "../generated/UncrashableEntityHelpers"
// } from "../generated/UncrashableEntityHelpers.edited"
// import { tokenToString } from "typescript";

export function handleGreetingChange(event: GreetingChange): void {
  let senderString = event.params.greetingSetter.toHexString();

  let sender = Sender.load(senderString);

  if (sender === null) {
    sender = new Sender(senderString);
    sender.address = event.params.greetingSetter;
    sender.createdAt = event.block.timestamp;
    sender.greetingCount = BigInt.fromI32(1);
  } else {
    sender.greetingCount = sender.greetingCount.plus(BigInt.fromI32(1));
  }

  let greeting = new Greeting(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );

  greeting.greeting = event.params.newGreeting;
  greeting.sender = senderString;
  greeting.premium = event.params.premium;
  greeting.value = event.params.value;
  greeting.createdAt = event.block.timestamp;
  greeting.transactionHash = event.transaction.hash.toHex();

  greeting.save();
  sender.save();
}

export function handleCampaignCreated(event: CampaignCreatedEvent): void {

  let campaignId = createCampaignId(event.params.campaignId);

  createCampaign(
    campaignId, {
    campaignId: event.params.campaignId,
    owner: Bytes.fromHexString(event.params.owner.toHexString()),
    title: event.params.title,
    claim: event.params.claim,
    description: event.params.description,
    amountCollected: BigInt.fromI32(0),
    amountWithdrawn: BigInt.fromI32(0),
    createdAt: event.block.timestamp,
  });
}

export function handleDonation(event: DonationEvent): void {

  // update the campaign's amountDonated
  let campaignId = getCampaignId(event.params.campaignId.toI32());
  let campaign = getCampaign(campaignId);
  if (campaign !== null) {
    campaign.amountCollected = campaign.amountCollected.plus(
      event.params.amount
    );
    campaign.save();
  }

  // create or update the donor
  let donorAddressAsHexString = event.params.donor.toHexString();
  let donorId = generateDonorId(Bytes.fromHexString(donorAddressAsHexString));
  let entity = getOrInitializeDonor(donorId, {
    createdAt: event.block.timestamp,
    donationCount: BigInt.fromI32(0)
  })

  let donor = entity.entity;
  donor.donationCount = donor.donationCount.plus(BigInt.fromI32(1));
  donor.save()

  // create the Donation
  let hex_string = ensureEvenCharacterHexString(event.transaction.hash.toHex().concat(event.logIndex.toString()))
  let donationId = generateDonationId(Bytes.fromHexString(hex_string));

  createDonation(
    donationId, {
    campaign: campaignId,
    donor: event.params.donor.toHexString(),
    amount: event.params.amount,
    comment: event.params.comment,
    createdAt: event.block.timestamp,
  });
}

export function handleWithdrawal(event: WithdrawalEvent): void {

  // add withdraw amount from campaign.amountWithdrawn
  let campaignId = getCampaignId(event.params.campaignId.toI32())
  let campaign = getCampaign(campaignId);
  if (campaign !== null) {
    campaign.amountWithdrawn = campaign.amountWithdrawn.plus(
      event.params.amount
    );
    campaign.save();
  }

  // create or update the Withdrawer
  let withdrawerAddressAsHexString = event.params.withdrawer.toHexString();
  let withdrawerId = generateWithdrawerId(Bytes.fromHexString(withdrawerAddressAsHexString));
  let entity = getOrInitializeWithdrawer(withdrawerId, {
    createdAt: event.block.timestamp,
    withdrawalCount: BigInt.fromI32(0)
  })

  let withdrawer = entity.entity;
  withdrawer.withdrawalCount = withdrawer.withdrawalCount.plus(BigInt.fromI32(1));
  withdrawer.save()

  // create the withdrawal
  let hex_string = ensureEvenCharacterHexString(event.transaction.hash.toHex().concat(event.logIndex.toString()))
  let withdrawalId = generateWithdrawalId(Bytes.fromHexString(hex_string));
  createWithdrawal(
    withdrawalId, {
    campaign: campaignId,
    withdrawer: event.params.withdrawer.toHexString(),
    amount: event.params.amount,
    comment: event.params.comment,
    createdAt: event.block.timestamp,
  });
}

export function handleFollow(event: FollowEvent): void {

  // add withdraw amount from campaign.amountWithdrawn
  let campaignId = getCampaignId(event.params.campaignId.toI32())
  let campaign = getCampaign(campaignId);

  // generate the followId from the campaignId and the user address
  let campaignIdHexString = ensureEvenCharacterHexString(event.params.campaignId.toHexString());
  let userHexString = event.params.user.toHexString().replace("0x","");
  let campaignAndUserHexString = campaignIdHexString.concat(userHexString);
  let followId = generateFollowId(Bytes.fromHexString(campaignAndUserHexString));

  createFollow(
    followId, {
      campaign: campaign.id,
      user: Bytes.fromHexString(event.params.user.toHexString()),
      createdAt: event.block.timestamp,
    }
  );
}

export function handleUnfollow(event: UnfollowEvent): void {

  // generate the followId from the campaignId and the user address
  let campaignIdHexString = ensureEvenCharacterHexString(event.params.campaignId.toHexString());
  let userHexString = event.params.user.toHexString().replace("0x","");
  let campaignAndUserHexString = campaignIdHexString.concat(userHexString);
  let followId = generateFollowId(Bytes.fromHexString(campaignAndUserHexString));

  store.remove('Follow', followId);
}

// export function handleOwnershipTransferred(event: OwnershipTransferredEvent): void {

//   let transferId = false ? generateOwnershipTransferredId(Bytes.fromHexString("id")) : generateOwnershipTransferredId(
//     event.transaction.hash.concatI32(
//       event.logIndex.toI32()
//     )
//   );

//   createOwnershipTransferred(
//     transferId, {
//       previousOwner: Bytes.fromHexString(event.params.previousOwner.toHexString()),
//       newOwner: Bytes.fromHexString(event.params.newOwner.toHexString()),
//       blockNumber: event.block.number,
//       blockTimestamp: event.block.timestamp,
//       transactionHash: event.transaction.hash,
//     }
//   );
// }

export function handleUpdateCampaignOwner(event: CampaignOwnerUpdatedEvent): void {
  updateCampaignOwner(createCampaignId(event.params.campaignId), {
    owner: event.params.owner
  });
}

export function handleUpdateCampaignTitle(event: CampaignTitleUpdatedEvent): void {
  updateCampaignTitle(createCampaignId(event.params.campaignId), {
    title: event.params.title
  });
}

export function handleUpdateCampaignClaim(event: CampaignClaimUpdatedEvent): void {
  updateCampaignClaim(createCampaignId(event.params.campaignId), {
    claim: event.params.claim
  });
}

export function handleUpdateCampaignDescription(event: CampaignDescriptionUpdatedEvent): void {
  updateCampaignDescription(createCampaignId(event.params.campaignId), {
    description: event.params.description
  });
}

/**
 * Some functions require that the hex strings have an even number of characters
 * @param hex_string string
 * @returns string
 */
export function ensureEvenCharacterHexString(hex_string: string): string {

  if (hex_string.length % 2) {
    if (hex_string.startsWith("0x")) {
      hex_string = hex_string.replace("0x", "");
    }
    hex_string = "0x0" + hex_string;
  }

  return hex_string.slice(0, 44)
}

/**
 * Takes a BigInt and returns a hex string in the form e.g. "0x0001"
 * @param BigInt campaignId 
 * @returns string
 */
export function createCampaignId(campaignId: BigInt): string {
  // let hex = campaignId.toHexString();
  // if (hex.length % 2) {
  //   hex = '0' + hex;
  // }

  // take a BigInt, convert it to Bytes
  // campaignId.toString()
  // campaignId.toI32()

  // BigInt.toHex(): string
  // Bytes.fromHexString(hex: string) : Bytes

  let hex_string: string = campaignId.toHexString();

  hex_string = ensureEvenCharacterHexString(hex_string);

  let bytes: Bytes = Bytes.fromHexString(hex_string);

  let id: string = generateCampaignId(bytes);

  return id;
}

export function incrementDonationCount(entityId: string): void {
  let entity = getDonor(entityId);
  entity.donationCount = entity.donationCount.plus(BigInt.fromI32(1));

  entity.save();
}

export function incrementWithdrawalCount(entityId: string): void {
  let entity = getWithdrawer(entityId);
  entity.withdrawalCount = entity.withdrawalCount.plus(BigInt.fromI32(1));

  entity.save();
}

export function getCampaignId(campaignId: u32): string {
  return generateCampaignId(
    Bytes.fromHexString(
      createCampaignId(
        BigInt.fromU32(campaignId)
      )
    )
  );
}