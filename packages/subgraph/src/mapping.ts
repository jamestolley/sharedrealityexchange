import { Bytes, BigInt, ByteArray } from "@graphprotocol/graph-ts";
import {
  YourContract,
  GreetingChange,
} from "../generated/YourContract/YourContract";
import { 
  SharedRealityExchange,
  CampaignCreated as CampaignCreatedEvent,
  Donation as DonationEvent,
  Withdrawal as WithdrawalEvent,
  OwnershipTransferred as OwnershipTransferredEvent
} from "../generated/SharedRealityExchange/SharedRealityExchange";
import { Greeting, Sender, Campaign, Donation, Withdrawal, OwnershipTransferred } from "../generated/schema";
import {
  generateCampaignId,
  createCampaign,
  getCampaign,
  createDonation,
  generateDonationId,
  generateWithdrawalId,
  createWithdrawal,
  generateOwnershipTransferredId,
  createOwnershipTransferred
} from "../generated/UncrashableEntityHelpers"
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
    blockNumber: event.block.number,
    blockTimestamp: event.block.timestamp,
    transactionHash: event.transaction.hash,
  });
}

export function handleDonation(event: DonationEvent): void {

  let campaignId = createCampaignId(event.params.campaignId);

  let campaign = getCampaign(campaignId);
  if (campaign !== null) {
    campaign.amountCollected = campaign.amountCollected.plus(
      event.params.amount
    );
    campaign.save();
  }

  let donationId = generateDonationId(
    event.transaction.hash.concatI32(
      event.logIndex.toI32()
    )
  );

  createDonation(
    donationId, {
    campaignId: event.params.campaignId,
    donor: Bytes.fromHexString(event.params.donor.toHexString()),
    amount: event.params.amount,
    blockNumber: event.block.number,
    blockTimestamp: event.block.timestamp,
    transactionHash: event.transaction.hash,
  });
}

export function handleWithdrawal(event: WithdrawalEvent): void {

  let campaignId = createCampaignId(event.params.campaignId);

  let campaign = getCampaign(campaignId);
  if (campaign !== null) {
    campaign.amountCollected = campaign.amountCollected.plus(
      event.params.amount
    );
    campaign.save();
  }

  let withdrawalId = generateWithdrawalId(
    event.transaction.hash.concatI32(
      event.logIndex.toI32()
    )
  );

  createWithdrawal(
    withdrawalId, {
    campaignId: event.params.campaignId,
    owner: Bytes.fromHexString(event.params.owner.toHexString()),
    amount: event.params.amount,
    blockNumber: event.block.number,
    blockTimestamp: event.block.timestamp,
    transactionHash: event.transaction.hash,
  });
}

export function handleOwnershipTransferred(event: OwnershipTransferredEvent): void {

  let transferId = generateOwnershipTransferredId(
    event.transaction.hash.concatI32(
      event.logIndex.toI32()
    )
  );

  createOwnershipTransferred(
    transferId, {
      previousOwner: Bytes.fromHexString(event.params.previousOwner.toHexString()),
      newOwner: Bytes.fromHexString(event.params.newOwner.toHexString()),
      blockNumber: event.block.number,
      blockTimestamp: event.block.timestamp,
      transactionHash: event.transaction.hash,
    }
  );
}
/**
 * 
 * @param BigInt campaignId 
 * @returns string
 */
function createCampaignId(campaignId: BigInt): string {
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

  if (hex_string.length % 2) {
    if (hex_string.startsWith("0x")) {
      hex_string = hex_string.replace("0x", "");
    }
    hex_string = "0x0" + hex_string;
  }

  let bytes: Bytes = Bytes.fromHexString(hex_string);

  let id: string = generateCampaignId(bytes);

  return id;
}
