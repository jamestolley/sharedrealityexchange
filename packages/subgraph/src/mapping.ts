import { Bytes, BigInt, store } from "@graphprotocol/graph-ts";
import {
  GreetingChange,
} from "../generated/YourContract/YourContract";
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
  CreateIdea as CreateIdeaEvent,
  UpdateIdeaParent as UpdateIdeaParentEvent,
  UpdateIdeaPosition as UpdateIdeaPositionEvent,
  UpdateIdeaText as UpdateIdeaTextEvent,
  UpdateIdeaType as UpdateIdeaTypeEvent,
  DeleteIdea as DeleteIdeaEvent,
  CreateSpecialistGroup as CreateSpecialistGroupEvent,
  SpecialistGroupOwnerUpdated as SpecialistGroupOwnerUpdatedEvent,
  SpecialistGroupNameUpdated as SpecialistGroupNameUpdatedEvent,
  SpecialistGroupSpecificationUpdated as SpecialistGroupSpecificationUpdatedEvent,
  SpecialistGroupStatusUpdated as SpecialistGroupStatusUpdatedEvent,
  DeleteSpecialistGroup as DeleteSpecialistGroupEvent,
  SpecialistAddedToGroup as SpecialistAddedToGroupEvent,
  SpecialistRemovedFromGroup as SpecialistRemovedFromGroupEvent,
  SpecialistGroupAddedToCampaign as SpecialistGroupAddedToCampaignEvent,
  SpecialistGroupRemovedFromCampaign as SpecialistGroupRemovedFromCampaignEvent,
  TruthRatingCreated as TruthRatingCreatedEvent,
  TruthRatingUpdated as TruthRatingUpdatedEvent,
  TruthRatingDeleted as TruthRatingDeletedEvent
} from "../generated/SharedRealityExchange/SharedRealityExchange";
import { Greeting, Sender, Idea, Campaign } from "../generated/schema";
import {
  generateCampaignId,
  generateDonorId,
  generateWithdrawerId,
  generateDonationId,
  generateWithdrawalId,
  generateFollowId,
  generateCampaignUpdateId,
  generateIdeaId,
  getOrInitializeDonor,
  getOrInitializeWithdrawer,
  getIdea,
  createCampaign,
  getCampaign,
  createDonation,
  createWithdrawal,
  createCampaignUpdate,
  updateCampaignOwner,
  updateCampaignTitle,
  updateCampaignClaim,
  updateCampaignDescription,
  getDonor,
  getWithdrawer,
  createFollow,
  createIdea,
  updateIdeaText,
  updateIdeaType,
  updateIdeaParent,
  updateIdeaParentIndex,
  updateIdeaPosition,
  generateSpecialistGroupId,
  generateSpecialistGroupMembershipId,
  generateSpecialistGroupCampaignConnectionId,
  updateSpecialistGroupName,
  updateSpecialistGroupOwner,
  updateSpecialistGroupStatus,
  updateSpecialistGroupSpecification,
  createSpecialistGroup,
  createSpecialistGroupMembership,
  getSpecialistGroup,
  getSpecialistGroupMembership,
  createSpecialistGroupCampaignConnection,
  getSpecialistGroupCampaignConnection,
  generateTruthRatingId,
  createTruthRating,
  updateTruthRating
} from "../generated/UncrashableEntityHelpers"

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

/** Campaigns */

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


/** Donations / Withdrawals */

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

/** Follows / Unfollows */

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

/** CampaignUpdates */

export function handleCampaignUpdate(event: CampaignUpdateEvent): void {

  // update the campaign's amountDonated
  let campaignId = getCampaignId(event.params.campaignId.toI32());
  let campaign = getCampaign(campaignId);

  // create the CampaignUpdate
  let hex_string = ensureEvenCharacterHexString(event.transaction.hash.toHex().concat(event.logIndex.toString()))
  let updateId = generateCampaignUpdateId(Bytes.fromHexString(hex_string));

  createCampaignUpdate(updateId, {
    campaign: campaignId,
    author: Bytes.fromHexString(event.params.author.toHexString()),
    title: event.params.title,
    content: event.params.content,
    createdAt: event.block.timestamp,
  });
}

/** Ideas */

export function handleCreateIdea(event: CreateIdeaEvent): void {

  const campaignId = getCampaignId(event.params.campaignId.toU32());
  const campaign = getCampaign(campaignId);
  
  const logIndex = event.logIndex.toString();
  const nonce = event.params.nonce.toString();
  const hexString = event.transaction.hash.toHex().concat(logIndex).concat(nonce);
  const evenHexString = ensureEvenCharacterHexString(hexString);
  const ideaId = generateIdeaId(Bytes.fromHexString(evenHexString));

  let parentIndex = 0;

  if (event.params.parentId != "0x0000000000000000000000000000000000000000") {
    const parentId = generateIdeaId(Bytes.fromHexString(event.params.parentId));
    const parentIdea = getIdea(parentId);
    let children = parentIdea.children;
    children.push(ideaId);
    parentIdea.children = children;
    parentIdea.save();

    parentIndex = children.length - 1;
  }

  createIdea(ideaId, {
    parentId: event.params.parentId,
    parentIndex: parentIndex,
    children: new Array<string>(),
    ideaType: event.params.ideaType,
    text: event.params.text,
    campaign: campaign.id,
    x: event.params.x,
    y: event.params.y
  });

  // return ideaId;
}

export function handleUpdateIdeaText(event: UpdateIdeaTextEvent): void {
  updateIdeaText(event.params.ideaId, {
    text: event.params.text
  });
}

export function handleUpdateIdeaType(event: UpdateIdeaTypeEvent): void {
  updateIdeaType(event.params.ideaId, {
    ideaType: event.params.ideaType
  });
}

export function handleUpdateIdeaParent(event: UpdateIdeaParentEvent): void {

  const thisIdea = getIdea(event.params.ideaId); // child

  // cannot change the parent of the claim
  if (thisIdea.parentId.toString() == "0x0000000000000000000000000000000000000000") {
    return;
  }

  const oldParent = getIdea(thisIdea.parentId.toString()); // claim
  const indexToDelete = thisIdea.parentIndex; // 0
  const children = oldParent.children; // claim's children
  const indexToMove = children.length - 1; // 1

  // delete self from oldParent's children array
  const movedIdeaId = children.pop(); // grandchildId

  // update the parentIndex of the moved old sibling
  if (indexToDelete != indexToMove) { // 
    children[indexToDelete] = movedIdeaId; // [grandchildId]

    updateIdeaParentIndex(movedIdeaId, {
      parentIndex: indexToDelete, // 0
    })
  }

  // save the updated oldParent.children array
  oldParent.children = children; // claim.children: [grandchildId]
  oldParent.save(); // 
  
  // update the newParent's children array
  const newParent = getIdea(event.params.parentId); // grandchildIdea
  const newChildren = newParent.children; // grandchildIdea
  newChildren.push(event.params.ideaId); // grandchildIdea.children: [childId]
  newParent.children = newChildren; // save it
  newParent.save(); // 

  // update this idea's parentId and parentIndex
  updateIdeaParent(event.params.ideaId, { // childId
    parentId: event.params.parentId, // grandchildId
    parentIndex: newChildren.length - 1, // 0
  });
}

export function handleUpdateIdeaPosition(event: UpdateIdeaPositionEvent): void {

  updateIdeaPosition(event.params.ideaId, {
    x: event.params.x,
    y: event.params.y,
  });

}

/**
 * To be called only by handleDeleteIdea, when deleting the ideas in the children array
 */
function deleteIdeaTree(thisIdea: Idea): void {

  // remove all of one's own children
  for (let i = 0; i < thisIdea.children.length; i++) {
    const nextIdea = getIdea(thisIdea.children[i]);
    deleteIdeaTree(nextIdea);
  }

  store.remove("Idea", thisIdea.id);
}

export function handleDeleteIdea(event: DeleteIdeaEvent): void {

  const thisIdea = getIdea(event.params.ideaId); // grandchild

  // cannot delete the claim
  if (thisIdea.parentId.toString() == "0x0000000000000000000000000000000000000000") {
    return;
  }

  const oldParent = getIdea(thisIdea.parentId.toString()); // claim
  const indexToDelete = thisIdea.parentIndex; // 0
  const children = oldParent.children; // claim's children
  const indexToMove = children.length - 1; // 1

  // delete self from oldParent's children array
  const movedIdeaId = children.pop(); // childId

  // update the parentIndex of the moved old sibling
  if (indexToDelete != indexToMove) { // 
    children[indexToDelete] = movedIdeaId; // [childId]

    updateIdeaParentIndex(movedIdeaId, {
      parentIndex: indexToDelete, // 0
    })
  }

  // save the updated oldParent.children array
  oldParent.children = children; // claim.children: [grandchildId]
  oldParent.save(); // 

  // delete this idea and all of its descendents
  deleteIdeaTree(thisIdea);

}

/** SpecialistGroups */

export function handleCreateSpecialistGroup(event: CreateSpecialistGroupEvent): void {

  const groupId = getSpecialistGroupId(event.params.groupId.toU32());

  // const groupIndex = event.params.groupId;
  // const hexString = event.transaction.hash.toHex().concat(groupIndex.toString());
  // const evenHexString = ensureEvenCharacterHexString(hexString);
  // const groupId = generateSpecialistGroupId(Bytes.fromHexString(evenHexString));

  const storableOwner = Bytes.fromHexString(event.params.owner.toHexString());

  createSpecialistGroup(groupId, {
    owner: storableOwner,
    groupId: event.params.groupId.toI32(),
    status: 0,
    name: event.params.name,
    specification: event.params.specification,
    createdAt: event.block.timestamp
  });

  // since the owner must be a member of the group, let's add them now

  const groupIdAsU32 = event.params.groupId.toU32();
  const groupId2 = getSpecialistGroupId(groupIdAsU32);

  const memberIdAsString: string = event.params.owner.toString();
  const groupMembershipId = getSpecialistGroupMembershipId(groupIdAsU32, memberIdAsString);

  createSpecialistGroupMembership(groupMembershipId, {
    group: groupId2,
    owner: storableOwner,
    member: storableOwner,
    comments: "Owners are automatically added to their specialist groups",
    evidenceUrl: "",
    createdAt: event.block.timestamp
  });



}

export function handleSpecialistGroupOwnerUpdated(event: SpecialistGroupOwnerUpdatedEvent): void {

  const groupId = getSpecialistGroupId(event.params.groupId.toU32());

  updateSpecialistGroupOwner(groupId, {
    owner: Bytes.fromHexString(event.params.owner.toHexString())
  });
}

export function handleSpecialistGroupNameUpdated(event: SpecialistGroupNameUpdatedEvent): void {

  const groupId = getSpecialistGroupId(event.params.groupId.toU32());

  updateSpecialistGroupName(groupId, {
    name: event.params.name
  });
}

export function handleSpecialistGroupSpecificationUpdated(event: SpecialistGroupSpecificationUpdatedEvent): void {

  const groupId = getSpecialistGroupId(event.params.groupId.toU32());

  updateSpecialistGroupSpecification(groupId, {
    specification: event.params.specification
  });
}

export function handleSpecialistGroupStatusUpdated(event: SpecialistGroupStatusUpdatedEvent): void {

  const groupId = getSpecialistGroupId(event.params.groupId.toU32());

  updateSpecialistGroupStatus(groupId, {
    status: event.params.status
  });
}

export function handleDeleteSpecialistGroup(event: DeleteSpecialistGroupEvent): void {

  const groupId = getSpecialistGroupId(event.params.groupId.toU32());

  const group = getSpecialistGroup(groupId);

  if (group) {
    // delete all of the memberships
    const memberships = group.memberships.load();
    for (let i = 0; i < memberships.length; i++) {
      // const membership = getSpecialistGroupMembership(memberships[i]!.toString());
      store.remove("SpecialistGroupMembership", memberships[i].id);
    }
  }

  store.remove('SpecialistGroup', groupId);
}

export function handleSpecialistAddedToGroup(event: SpecialistAddedToGroupEvent): void {

  const groupIdAsU32 = event.params.groupId.toU32();
  const groupId = getSpecialistGroupId(groupIdAsU32);

  const memberIdAsString: string = event.params.memberId.toString();
  const groupMembershipId = getSpecialistGroupMembershipId(groupIdAsU32, memberIdAsString);

  createSpecialistGroupMembership(groupMembershipId, {
    group: groupId,
    owner: Bytes.fromHexString(event.params.owner.toHexString()),
    member: Bytes.fromHexString(event.params.memberId.toHexString()),
    comments: event.params.comments,
    evidenceUrl: event.params.evidenceUrl,
    createdAt: event.block.timestamp
  });
  
}

export function handleSpecialistRemovedFromGroup(event: SpecialistRemovedFromGroupEvent): void {

  const groupIdAsU32 = event.params.groupId.toU32();
  const memberIdAsString: string = event.params.memberId.toString();
  const groupMembershipId = getSpecialistGroupMembershipId(groupIdAsU32, memberIdAsString);

  store.remove("SpecialistGroupMembership", groupMembershipId);

}

export function handleSpecialistGroupAddedToCampaign(event: SpecialistGroupAddedToCampaignEvent): void {

  // load the campaign
  const campaignId = getCampaignId(event.params.campaignId.toU32());
  const campaign = getCampaign(campaignId);

  // load the group
  const groupId = getSpecialistGroupId(event.params.groupId.toU32());
  const group = getSpecialistGroup(groupId);

  // create the connectionId
  const connectionId = getSpecialistGroupCampaignConnectionId(event.params.groupId.toU32(), event.params.campaignId.toU32());

  // creates the connection entity
  createSpecialistGroupCampaignConnection(connectionId, {
    owner: Bytes.fromHexString(event.params.owner.toHexString()),
    campaign: campaign.id,
    group: group.id,
    comments: event.params.comments,
    createdAt: event.block.timestamp
  });
  

}

export function handleSpecialistGroupRemovedFromCampaign(event: SpecialistGroupRemovedFromCampaignEvent): void {

  // create the connectionId
  const connectionId = getSpecialistGroupCampaignConnectionId(event.params.groupId.toU32(), event.params.campaignId.toU32());

  store.remove("SpecialistGroupCampaignConnection", connectionId)
}

/** TruthRatings */

export function handleTruthRatingCreated(event: TruthRatingCreatedEvent): void {

  // load the campaign
  const campaignId = getCampaignId(event.params.campaignId.toU32());
  const campaign = getCampaign(campaignId);

  // load the group
  const groupId = getSpecialistGroupId(event.params.groupId.toU32());
  const group = getSpecialistGroup(groupId);

  // load the idea
  // const idea = Idea.load(event.params.ideaId);
  
  const truthRatingId = getTruthRatingId(event.params.campaignId.toU32(), event.params.groupId.toU32(), event.params.ideaId, event.params.owner.toString());

  createTruthRating(truthRatingId, {
    campaign: campaign.id,
    group: group.id,
    idea: event.params.ideaId,
    rater: event.params.owner.toString(),
    ratingScore: event.params.ratingScore,
    comments: event.params.comments,
    createdAt: event.block.timestamp
  });
}

export function handleTruthRatingUpdated(event: TruthRatingUpdatedEvent): void {
  
  const truthRatingId = getTruthRatingId(event.params.campaignId.toU32(), event.params.groupId.toU32(), event.params.ideaId, event.params.owner.toString());

  updateTruthRating(truthRatingId, {
    ratingScore: event.params.ratingScore,
    comments: event.params.comments
  });
}

export function handleTruthRatingDeleted(event: TruthRatingDeletedEvent): void {
  
  const truthRatingId = getTruthRatingId(event.params.campaignId.toU32(), event.params.groupId.toU32(), event.params.ideaId, event.params.owner.toString());

  store.remove("TruthRating", truthRatingId);
}

/**
 * helper functions below...
 */

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

export function getSpecialistGroupId(groupId: u32): string {
  return getCampaignId(groupId);
}

export function getSpecialistGroupMembershipId(groupId: u32, memberId: string): string {

  // get the hex of the groupId
  let groupHexString: string = BigInt.fromU32(groupId).toHexString();

  // get the hex of the memberId
  // let memberHexString: string = memberId.toHexString();

  // combine them into a short, even hex string
  let hexString = groupHexString.concat(memberId.replace("0x",""));
  let evenHexString = ensureEvenCharacterHexString(hexString);

  // finish the algorithm from there
  return generateSpecialistGroupMembershipId(Bytes.fromHexString(evenHexString));

}

export function getSpecialistGroupCampaignConnectionId(groupId: u32, campaignId: u32): string {
  return getSpecialistGroupMembershipId(groupId, campaignId.toString());
}

export function getTruthRatingId(campaignId: u32, groupId: u32, ideaId: string, owner: string): string {
  const stringParameter: string = owner.concat(ideaId.replace("0x","")).concat(groupId.toString());
  return getSpecialistGroupMembershipId(groupId, stringParameter);
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