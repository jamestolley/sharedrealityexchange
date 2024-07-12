import { describe, test, assert, beforeAll, logStore, newMockEvent } from "matchstick-as";
import { Address, BigInt, Bytes, ethereum, log } from "@graphprotocol/graph-ts";
import { Campaign, Idea } from "../generated/schema";
// import { generateCampaignId, generateDonationId, generateWithdrawalId } from "../generated/UncrashableEntityHelpers";
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
  UpdateIdeaText as UpdateIdeaTextEvent,
  UpdateIdeaType as UpdateIdeaTypeEvent,
  DeleteIdea as DeleteIdeaEvent
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
  handleCampaignUpdate,
  handleCreateIdea,
  handleUpdateIdeaText,
  handleUpdateIdeaType,
  handleUpdateIdeaParent,
  handleDeleteIdea
} from "../src/mapping";

// interface IIdeaType {
//   id: string;
//   parentId: string;
//   parentIndex: number;
//   children: string[];
//   ideaType: number;
//   text: string;
// };

// export type IdeaType = IIdeaType;

//
// these seemingly good lines of code are not working, so I'll hard-code the values...
//
// type IdeaTypeType = {
//   Claim: 0;
//   Pro: 1;
//   Con: 2;
//   Part: 3;
// };

// const IdeaType: IdeaTypeType = {
//   "Claim": 0,
//   "Pro": 1,
//   "Con": 2,
//   "Part": 3,
// };

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

    // logStore();
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

  test("createIdea", () => {

    let newIdeaEvent = createIdeaEvent(0, 0, "0x0000000000000000000000000000000000000000", 0, "idea text");
    handleCreateIdea(newIdeaEvent);
    
    //
    // test that the claim was stored properly
    //
    let campaignId = getCampaignId(0);

    const campaign = Campaign.load(campaignId);
    assert.assertNotNull(
        campaign,
        "Loaded Campaign should not be null"
    );

    let ideas = campaign!.ideas.load();

    assert.equals(ethereum.Value.fromI32(1), ethereum.Value.fromI32(ideas.length));

    let claim = ideas[0];
    assert.assertNotNull(
      claim,
      "Loaded Idea (claim) should not be null"
    );

    if (claim) {

      assert.fieldEquals("Idea", claim.id, "campaign", campaignId);
      assert.fieldEquals("Idea", claim.id, "parentId", "0x0000000000000000000000000000000000000000");
      assert.fieldEquals("Idea", claim.id, "parentIndex", "0");
      assert.equals(ethereum.Value.fromI32(claim.children.length), ethereum.Value.fromI32(0));
      assert.fieldEquals("Idea", claim.id, "ideaType", "0");
      assert.fieldEquals("Idea", claim.id, "text", "idea text");

      assert.entityCount("Idea", 1);

    }
    else {
      assert.equals(ethereum.Value.fromBoolean(true), ethereum.Value.fromBoolean(false));
    }

  });

  test("updateIdea text and type", () => {

    //
    // test that the claim was stored properly
    //
    let campaignId = getCampaignId(0);

    const campaign = Campaign.load(campaignId);
    assert.assertNotNull(
        campaign,
        "Loaded Campaign should not be null"
    );

    let ideas = campaign!.ideas.load();

    assert.equals(ethereum.Value.fromI32(1), ethereum.Value.fromI32(ideas.length));

    let claim = ideas[0];
    assert.assertNotNull(
      claim,
      "Loaded Idea (claim) should not be null"
    );

    if (claim) {
      assert.fieldEquals("Idea", claim.id, "campaign", campaignId);
      assert.fieldEquals("Idea", claim.id, "parentId", "0x0000000000000000000000000000000000000000");
      assert.fieldEquals("Idea", claim.id, "parentIndex", "0");
      assert.equals(ethereum.Value.fromI32(claim.children.length), ethereum.Value.fromI32(0));
      assert.fieldEquals("Idea", claim.id, "ideaType", "0");
      assert.fieldEquals("Idea", claim.id, "text", "idea text");

      assert.entityCount("Idea", 1);

      // logStore();
  
      // update the claim's text & type
      const updateIdeaTextEvent = createUpdateIdeaTextEvent(0, claim.id, "updated idea text");
      handleUpdateIdeaText(updateIdeaTextEvent);

      const updateIdeaTypeEvent = createUpdateIdeaTypeEvent(0, claim.id, 2);
      handleUpdateIdeaType(updateIdeaTypeEvent);

      const updatedClaim = Idea.load(claim.id);
      if (updatedClaim) {
        assert.fieldEquals("Idea", updatedClaim.id, "parentId", "0x0000000000000000000000000000000000000000");
        assert.fieldEquals("Idea", updatedClaim.id, "parentIndex", "0");
        assert.equals(ethereum.Value.fromI32(updatedClaim.children.length), ethereum.Value.fromI32(0));
        assert.fieldEquals("Idea", updatedClaim.id, "ideaType", "2");
        assert.fieldEquals("Idea", updatedClaim.id, "text", "updated idea text");

        // logStore();
        
      }
      else {
        assert.equals(ethereum.Value.fromBoolean(true), ethereum.Value.fromBoolean(false));
      }

    }
    else {
      assert.equals(ethereum.Value.fromBoolean(true), ethereum.Value.fromBoolean(false));
    }

  });

  test("create child Idea", () => {

    assert.entityCount("Idea", 1);

    //
    // test that the claim was stored properly
    //
    let campaignId = getCampaignId(0);

    const campaign = Campaign.load(campaignId);
    assert.assertNotNull(
        campaign,
        "Loaded Campaign should not be null"
    );

    let ideas = campaign!.ideas.load();

    assert.equals(ethereum.Value.fromI32(1), ethereum.Value.fromI32(ideas.length));

    let claim = ideas[0];
    assert.assertNotNull(
      claim,
      "Loaded Idea (claim) should not be null"
    );

    if (claim) {
    
      let newIdeaEvent = createIdeaEvent(1, 0, claim.id, 1, "child idea text");
      handleCreateIdea(newIdeaEvent);

      assert.entityCount("Idea", 2);

      // logStore();

      const newCampaign = Campaign.load(campaignId);
      assert.assertNotNull(
          campaign,
          "Loaded Campaign should not be null"
      );
  
      let ideas = campaign!.ideas.load();
  
      assert.equals(ethereum.Value.fromI32(2), ethereum.Value.fromI32(ideas.length));
  
      const childIdea = ideas.filter(idea => idea.parentId != "0x0000000000000000000000000000000000000000")[0];
      const parentIdea = ideas.filter(idea => idea.parentId == "0x0000000000000000000000000000000000000000")[0];
      assert.assertNotNull(
        childIdea,
        "Loaded childIdea should not be null"
      );
      assert.assertNotNull(
        parentIdea,
        "Loaded parentIdea should not be null"
      );

      if (childIdea && parentIdea) {

        assert.fieldEquals("Idea", parentIdea.id, "campaign", campaignId);
        assert.fieldEquals("Idea", parentIdea.id, "parentId", "0x0000000000000000000000000000000000000000");
        assert.fieldEquals("Idea", parentIdea.id, "parentIndex", "0");
        assert.equals(ethereum.Value.fromI32(parentIdea.children.length), ethereum.Value.fromI32(1));
        const parentChildId = parentIdea.children[0];
        if (parentChildId) {
          assert.equals(ethereum.Value.fromString(parentChildId), ethereum.Value.fromString(childIdea.id));
        }
        else {
          assert.equals(ethereum.Value.fromBoolean(false), ethereum.Value.fromBoolean(true));
        }
        assert.fieldEquals("Idea", parentIdea.id, "ideaType", "2");
        assert.fieldEquals("Idea", parentIdea.id, "text", "updated idea text");

        assert.fieldEquals("Idea", childIdea.id, "campaign", campaignId);
        assert.fieldEquals("Idea", childIdea.id, "parentId", parentIdea.id.toString());
        assert.fieldEquals("Idea", childIdea.id, "parentIndex", "0");
        assert.equals(ethereum.Value.fromI32(childIdea.children.length), ethereum.Value.fromI32(0));
        assert.fieldEquals("Idea", childIdea.id, "ideaType", "1");
        assert.fieldEquals("Idea", childIdea.id, "text", "child idea text");

      }

      // logStore();

    }
    else {
      assert.equals(ethereum.Value.fromBoolean(true), ethereum.Value.fromBoolean(false));
    }

  });

  test("create grandchild Idea", () => {

    assert.entityCount("Idea", 2);

    //
    // test that the claim was stored properly
    //
    let campaignId = getCampaignId(0);

    const campaign = Campaign.load(campaignId);
    assert.assertNotNull(
        campaign,
        "Loaded Campaign should not be null"
    );

    let ideas = campaign!.ideas.load();

    assert.equals(ethereum.Value.fromI32(2), ethereum.Value.fromI32(ideas.length));

    const claim = ideas.filter(idea => idea.parentId == "0x0000000000000000000000000000000000000000")[0];
    for (let i = 0; i < ideas.length; i++) {
      if (typeof ideas[i] == 'object' && ideas[i].parentId == claim.id) {
        var childIdea = ideas[i];
        break;
      }
    }
    assert.assertNotNull(
      claim,
      "Loaded claim should not be null"
    );
    assert.assertNotNull(
      childIdea,
      "Loaded childIdea should not be null"
    );

    if (claim && childIdea) {
    
      let newIdeaEvent = createIdeaEvent(2, 0, childIdea.id, 3, "grandchild idea text");
      handleCreateIdea(newIdeaEvent);

      assert.entityCount("Idea", 3);

      // logStore();

      const newCampaign = Campaign.load(campaignId);
      assert.assertNotNull(
          campaign,
          "Loaded Campaign should not be null"
      );
  
      let ideas = campaign!.ideas.load();
    
      for (let i = 0; i < ideas.length; i++) {
        if (typeof ideas[i] == 'object' && ideas[i].parentId == childIdea.id) {
          var grandchildIdea = ideas[i];
          break;
        }
      }

      assert.assertNotNull(
        grandchildIdea,
        "Loaded grandchildIdea should not be null"
      );

      if (claim && childIdea && grandchildIdea) {

        assert.fieldEquals("Idea", claim.id, "campaign", campaignId);
        assert.fieldEquals("Idea", claim.id, "parentId", "0x0000000000000000000000000000000000000000");
        assert.fieldEquals("Idea", claim.id, "parentIndex", "0"); //
        assert.equals(ethereum.Value.fromI32(claim.children.length), ethereum.Value.fromI32(1));
        const parentChildId1 = claim.children[0];
        if (parentChildId1) {
          assert.equals(ethereum.Value.fromString(parentChildId1), ethereum.Value.fromString(childIdea.id));
        }
        else {
          assert.equals(ethereum.Value.fromBoolean(false), ethereum.Value.fromBoolean(true));
        }
        assert.fieldEquals("Idea", claim.id, "ideaType", "2");
        assert.fieldEquals("Idea", claim.id, "text", "updated idea text");

        assert.fieldEquals("Idea", childIdea.id, "campaign", campaignId);
        assert.fieldEquals("Idea", childIdea.id, "parentId", claim.id.toString());
        assert.fieldEquals("Idea", childIdea.id, "ideaType", "1");
        assert.fieldEquals("Idea", childIdea.id, "text", "child idea text");
        
        assert.fieldEquals("Idea", grandchildIdea.id, "campaign", campaignId);
        assert.fieldEquals("Idea", grandchildIdea.id, "parentId", childIdea.id.toString());
        assert.fieldEquals("Idea", grandchildIdea.id, "parentIndex", "0"); //
        assert.equals(ethereum.Value.fromI32(grandchildIdea.children.length), ethereum.Value.fromI32(0)); //
        assert.fieldEquals("Idea", grandchildIdea.id, "ideaType", "3");
        assert.fieldEquals("Idea", grandchildIdea.id, "text", "grandchild idea text");

        // reload the child idea so we can check its children
        const reloadedChildIdea = Idea.load(childIdea.id);

        assert.assertNotNull(
          reloadedChildIdea,
          "Loaded reloadedChildIdea should not be null"
        );
        if (reloadedChildIdea) {
          assert.fieldEquals("Idea", reloadedChildIdea.id, "parentIndex", "0"); //
          assert.equals(ethereum.Value.fromI32(reloadedChildIdea.children.length), ethereum.Value.fromI32(1));
          const parentChildId2 = reloadedChildIdea.children[0];
          if (parentChildId2) {
            assert.equals(ethereum.Value.fromString(parentChildId2), ethereum.Value.fromString(grandchildIdea.id));
          }
          else {
            assert.equals(ethereum.Value.fromBoolean(false), ethereum.Value.fromBoolean(true));
          }
        }
        else {
          assert.equals(ethereum.Value.fromBoolean(false), ethereum.Value.fromBoolean(true));
        }

      }

      // logStore();

    }
    else {
      assert.equals(ethereum.Value.fromBoolean(true), ethereum.Value.fromBoolean(false));
    }

  });

  test("updateIdeaParent", () => {

    assert.entityCount("Idea", 3);

    //
    // test that the claim was stored properly
    //
    let campaignId = getCampaignId(0);

    const campaign = Campaign.load(campaignId);
    assert.assertNotNull(
        campaign,
        "Loaded Campaign should not be null"
    );

    let ideas = campaign!.ideas.load();

    assert.equals(ethereum.Value.fromI32(3), ethereum.Value.fromI32(ideas.length));

    const claim = ideas.filter(idea => idea.parentId == "0x0000000000000000000000000000000000000000")[0];
    for (let i = 0; i < ideas.length; i++) {
      if (typeof ideas[i] == 'object' && ideas[i].parentId == claim.id) {
        var childIdea = ideas[i];
        break;
      }
    }

    for (let i = 0; i < ideas.length; i++) {
      if (typeof ideas[i] == 'object' && ideas[i].parentId == childIdea.id) {
        var grandchildIdea = ideas[i];
        break;
      }
    }
    assert.assertNotNull(
      claim,
      "Loaded claim should not be null"
    );
    assert.assertNotNull(
      childIdea,
      "Loaded childIdea should not be null"
    );
    assert.assertNotNull(
      grandchildIdea,
      "Loaded grandchildIdea should not be null"
    );

    if (claim && childIdea && grandchildIdea) {

      // logStore();
    
      let updateIdeaParentEvent = createUpdateIdeaParentEvent(0, grandchildIdea.id, claim.id);
      handleUpdateIdeaParent(updateIdeaParentEvent);

      const reloadedClaim = Idea.load(claim.id);
      const reloadedChild = Idea.load(childIdea.id);
      const reloadedGrandchild = Idea.load(grandchildIdea.id);

      if (reloadedClaim && reloadedChild && reloadedGrandchild) {

        assert.fieldEquals("Idea", reloadedClaim.id, "campaign", campaignId);
        assert.fieldEquals("Idea", reloadedClaim.id, "parentId", "0x0000000000000000000000000000000000000000");
        assert.fieldEquals("Idea", reloadedClaim.id, "parentIndex", "0"); //
        assert.equals(ethereum.Value.fromI32(reloadedClaim.children.length), ethereum.Value.fromI32(2));
        const parentChildId1 = reloadedClaim.children[0];
        if (parentChildId1) {
          assert.equals(ethereum.Value.fromString(parentChildId1), ethereum.Value.fromString(childIdea.id));
        }
        else {
          assert.equals(ethereum.Value.fromBoolean(false), ethereum.Value.fromBoolean(true));
        }
        const parentChildId2 = reloadedClaim.children[1];
        if (parentChildId2) {
          assert.equals(ethereum.Value.fromString(parentChildId2), ethereum.Value.fromString(grandchildIdea.id));
        }
        else {
          assert.equals(ethereum.Value.fromBoolean(false), ethereum.Value.fromBoolean(true));
        }
        assert.fieldEquals("Idea", reloadedClaim.id, "ideaType", "2");
        assert.fieldEquals("Idea", reloadedClaim.id, "text", "updated idea text");

        assert.fieldEquals("Idea", reloadedChild.id, "campaign", campaignId);
        assert.fieldEquals("Idea", reloadedChild.id, "parentId", claim.id.toString());
        assert.fieldEquals("Idea", reloadedChild.id, "parentIndex", "0");
        assert.equals(ethereum.Value.fromI32(reloadedChild.children.length), ethereum.Value.fromI32(0));
        assert.fieldEquals("Idea", reloadedChild.id, "ideaType", "1");
        assert.fieldEquals("Idea", reloadedChild.id, "text", "child idea text");
        
        assert.fieldEquals("Idea", reloadedGrandchild.id, "campaign", campaignId);
        assert.fieldEquals("Idea", reloadedGrandchild.id, "parentId", reloadedClaim.id.toString());
        assert.fieldEquals("Idea", reloadedGrandchild.id, "parentIndex", "1"); //
        assert.equals(ethereum.Value.fromI32(reloadedGrandchild.children.length), ethereum.Value.fromI32(0)); //
        assert.fieldEquals("Idea", reloadedGrandchild.id, "ideaType", "3");
        assert.fieldEquals("Idea", reloadedGrandchild.id, "text", "grandchild idea text");

        // logStore();

      }
      else {
        assert.equals(ethereum.Value.fromBoolean(true), ethereum.Value.fromBoolean(false));
      }

    }
    else {
      assert.equals(ethereum.Value.fromBoolean(true), ethereum.Value.fromBoolean(false));
    }

  });

  test("updateIdeaParent 2", () => {

    assert.entityCount("Idea", 3);

    //
    // test that the claim was stored properly
    //
    let campaignId = getCampaignId(0);

    const campaign = Campaign.load(campaignId);
    assert.assertNotNull(
        campaign,
        "Loaded Campaign should not be null"
    );

    let ideas = campaign!.ideas.load();

    assert.equals(ethereum.Value.fromI32(3), ethereum.Value.fromI32(ideas.length));

    const claim = ideas.filter(idea => idea.parentId == "0x0000000000000000000000000000000000000000")[0];

    for (let i = 0; i < ideas.length; i++) {
      if (typeof ideas[i] == 'object' && ideas[i].parentId == claim.id && ideas[i].parentIndex == 0) {
        var childIdea = ideas[i];
        break;
      }
    }

    for (let i = 0; i < ideas.length; i++) {
      if (typeof ideas[i] == 'object' && ideas[i].parentId == claim.id && ideas[i].parentIndex == 1) {
        var grandchildIdea = ideas[i];
        break;
      }
    }
    assert.assertNotNull(
      claim,
      "Loaded claim should not be null"
    );
    assert.assertNotNull(
      childIdea,
      "Loaded childIdea should not be null"
    );
    assert.assertNotNull(
      grandchildIdea,
      "Loaded grandchildIdea should not be null"
    );

    if (claim && childIdea && grandchildIdea) {

      logStore();
    
      // updating the childIdea to be a child of the grandchild.
      // up to this point, both non-claims are children of the claim with the claim's children array like this: [childId, grandchildId]
      // we will remove the childId from the claim's children array and shift the grandchildId over
      // ending up with a one-element array which holds the grandchildId
      // the parentId and parentIndex fields of the children should also, of course, also be updated.
      let updateIdeaParentEvent = createUpdateIdeaParentEvent(0, childIdea.id, grandchildIdea.id); // campaignId, ideaId, newParent (id)
      handleUpdateIdeaParent(updateIdeaParentEvent);

      logStore();

      const reloadedClaim = Idea.load(claim.id);
      const reloadedChild = Idea.load(childIdea.id);
      const reloadedGrandchild = Idea.load(grandchildIdea.id);

      if (reloadedClaim && reloadedChild && reloadedGrandchild) {

        assert.fieldEquals("Idea", reloadedClaim.id, "campaign", campaignId);
        assert.fieldEquals("Idea", reloadedClaim.id, "parentId", "0x0000000000000000000000000000000000000000");
        assert.fieldEquals("Idea", reloadedClaim.id, "parentIndex", "0"); //
        assert.equals(ethereum.Value.fromI32(reloadedClaim.children.length), ethereum.Value.fromI32(1));
        const parentChildId1 = reloadedClaim.children[0];
        if (parentChildId1) {
          assert.equals(ethereum.Value.fromString(parentChildId1), ethereum.Value.fromString(reloadedGrandchild.id));
        }
        else {
          assert.equals(ethereum.Value.fromBoolean(false), ethereum.Value.fromBoolean(true));
        }
        assert.fieldEquals("Idea", reloadedClaim.id, "ideaType", "2");
        assert.fieldEquals("Idea", reloadedClaim.id, "text", "updated idea text");

        assert.fieldEquals("Idea", reloadedChild.id, "campaign", campaignId);
        assert.fieldEquals("Idea", reloadedChild.id, "parentId", reloadedGrandchild.id.toString());
        assert.fieldEquals("Idea", reloadedChild.id, "parentIndex", "0");
        assert.equals(ethereum.Value.fromI32(reloadedChild.children.length), ethereum.Value.fromI32(0));
        assert.fieldEquals("Idea", reloadedChild.id, "ideaType", "1");
        assert.fieldEquals("Idea", reloadedChild.id, "text", "child idea text");
        
        assert.fieldEquals("Idea", reloadedGrandchild.id, "campaign", campaignId);
        assert.fieldEquals("Idea", reloadedGrandchild.id, "parentId", reloadedClaim.id.toString());
        assert.fieldEquals("Idea", reloadedGrandchild.id, "parentIndex", "0");
        assert.equals(ethereum.Value.fromI32(reloadedGrandchild.children.length), ethereum.Value.fromI32(1));
        const parentChildId2 = reloadedGrandchild.children[0];
        if (parentChildId2) {
          assert.equals(ethereum.Value.fromString(parentChildId2), ethereum.Value.fromString(reloadedChild.id));
        }
        else {
          assert.equals(ethereum.Value.fromBoolean(false), ethereum.Value.fromBoolean(true));
        }
        assert.fieldEquals("Idea", reloadedGrandchild.id, "ideaType", "3");
        assert.fieldEquals("Idea", reloadedGrandchild.id, "text", "grandchild idea text");

        // logStore();

      }
      else {
        assert.equals(ethereum.Value.fromBoolean(true), ethereum.Value.fromBoolean(false));
      }

    }
    else {
      assert.equals(ethereum.Value.fromBoolean(true), ethereum.Value.fromBoolean(false));
    }

  });

  test("deleteIdea", () => {

    assert.entityCount("Idea", 3);

    //
    // test that the claim was stored properly
    //
    let campaignId = getCampaignId(0);

    const campaign = Campaign.load(campaignId);
    assert.assertNotNull(
        campaign,
        "Loaded Campaign should not be null"
    );

    let ideas = campaign!.ideas.load();

    assert.equals(ethereum.Value.fromI32(3), ethereum.Value.fromI32(ideas.length));

    const claim = ideas.filter(idea => idea.parentId == "0x0000000000000000000000000000000000000000")[0];

    for (let i = 0; i < ideas.length; i++) {
      if (typeof ideas[i] == 'object' && ideas[i].parentId == claim.id) {
        var grandchildIdea = ideas[i];
        break;
      }
    }

    for (let i = 0; i < ideas.length; i++) {
      if (typeof ideas[i] == 'object' && ideas[i].parentId == grandchildIdea.id) {
        var childIdea = ideas[i];
        break;
      }
    }
    assert.assertNotNull(
      claim,
      "Loaded claim should not be null"
    );
    assert.assertNotNull(
      childIdea,
      "Loaded childIdea should not be null"
    );
    assert.assertNotNull(
      grandchildIdea,
      "Loaded grandchildIdea should not be null"
    );

    if (claim && childIdea && grandchildIdea) {

      // logStore();
    
      // first, we will update the childId to be a child of the claim
      // that way, it will be second in the claim's children array
      // and will therefore need to be moved when we delete the grandchild.
      let updateIdeaParentEvent = createUpdateIdeaParentEvent(0, childIdea.id, claim.id); // campaignId, ideaId, newParent (id)
      handleUpdateIdeaParent(updateIdeaParentEvent);

      // we can now add some children and grandchildren to the grandchildIdea
      // all of these should be deleted along with the grandchildIdea

      assert.entityCount("Idea", 3);

      const createIdeaEvent1 = createIdeaEvent(3, 0, grandchildIdea.id, 3, "This is a test.");
      handleCreateIdea(createIdeaEvent1);

      const createIdeaEvent2 = createIdeaEvent(4, 0, grandchildIdea.id, 3, "This is a test.");
      // const createIdeaEvent2 = createIdeaEvent(4, 0, ideaId1, 3, "This is a test.");
      handleCreateIdea(createIdeaEvent2);

      const createIdeaEvent3 = createIdeaEvent(5, 0, grandchildIdea.id, 3, "This is a test.");
      // const createIdeaEvent3 = createIdeaEvent(5, 0, ideaId1, 3, "This is a test.");
      handleCreateIdea(createIdeaEvent3);

      const createIdeaEvent4 = createIdeaEvent(6, 0, grandchildIdea.id, 3, "This is a test.");
      // const createIdeaEvent4 = createIdeaEvent(6, 0, ideaId3, 3, "This is a test.");
      handleCreateIdea(createIdeaEvent4);

      assert.entityCount("Idea", 7);

      // now, delete the grandchild and test everything
      let deleteIdeaEvent = createDeleteIdeaEvent(0, grandchildIdea.id); // campaignId, ideaId
      handleDeleteIdea(deleteIdeaEvent);

      assert.entityCount("Idea", 2);

      // logStore();

      const reloadedClaim = Idea.load(claim.id);
      const reloadedChild = Idea.load(childIdea.id);
      // const reloadedGrandchild = Idea.load(grandchildIdea.id);

      if (reloadedClaim && reloadedChild) {

        assert.fieldEquals("Idea", reloadedClaim.id, "campaign", campaignId);
        assert.fieldEquals("Idea", reloadedClaim.id, "parentId", "0x0000000000000000000000000000000000000000");
        assert.fieldEquals("Idea", reloadedClaim.id, "parentIndex", "0"); //
        assert.equals(ethereum.Value.fromI32(reloadedClaim.children.length), ethereum.Value.fromI32(1));
        const parentChildId1 = reloadedClaim.children[0];
        if (parentChildId1) {
          assert.equals(ethereum.Value.fromString(parentChildId1), ethereum.Value.fromString(reloadedChild.id));
        }
        else {
          assert.equals(ethereum.Value.fromBoolean(false), ethereum.Value.fromBoolean(true));
        }
        assert.fieldEquals("Idea", reloadedClaim.id, "ideaType", "2");
        assert.fieldEquals("Idea", reloadedClaim.id, "text", "updated idea text");

        assert.fieldEquals("Idea", reloadedChild.id, "campaign", campaignId);
        assert.fieldEquals("Idea", reloadedChild.id, "parentId", reloadedClaim.id.toString());
        assert.fieldEquals("Idea", reloadedChild.id, "parentIndex", "0");
        assert.equals(ethereum.Value.fromI32(reloadedChild.children.length), ethereum.Value.fromI32(0));
        assert.fieldEquals("Idea", reloadedChild.id, "ideaType", "1");
        assert.fieldEquals("Idea", reloadedChild.id, "text", "child idea text");

        // logStore();

      }
      else {
        assert.equals(ethereum.Value.fromBoolean(true), ethereum.Value.fromBoolean(false));
      }

    }
    else {
      assert.equals(ethereum.Value.fromBoolean(true), ethereum.Value.fromBoolean(false));
    }

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
export function createIdeaEvent(nonce: u32, campaignId: u32, parentId: string, ideaType: i32, text: string): CreateIdeaEvent {
  // @ts-ignore
  let createIdeaEvent = changetype<CreateIdeaEvent>(newMockEvent())
  createIdeaEvent.parameters = new Array()

  // let theCampaignId = getCampaignId(campaignId)
  let nonceParam = new ethereum.EventParam("nonce", ethereum.Value.fromI32(nonce))
  let campaignIdParam = new ethereum.EventParam("campaignId", ethereum.Value.fromI32(campaignId))
  let parentIdParam = new ethereum.EventParam("parentId", ethereum.Value.fromString(parentId))
  let ideaTypeParam = new ethereum.EventParam("ideaType", ethereum.Value.fromI32(ideaType))
  let textParam = new ethereum.EventParam("text", ethereum.Value.fromString(text))

  createIdeaEvent.parameters.push(nonceParam)
  createIdeaEvent.parameters.push(campaignIdParam)
  createIdeaEvent.parameters.push(parentIdParam)
  createIdeaEvent.parameters.push(ideaTypeParam)
  createIdeaEvent.parameters.push(textParam)

  return createIdeaEvent
}

// @ts-ignore
export function createUpdateIdeaTextEvent(campaignId: u32, ideaId: string, newText: string): UpdateIdeaTextEvent {
  let updateIdeaTextEvent = changetype<UpdateIdeaTextEvent>(newMockEvent())
  updateIdeaTextEvent.parameters = new Array()

  let campaignIdParam = new ethereum.EventParam("campaignId", ethereum.Value.fromI32(campaignId))
  let ideaIdParam = new ethereum.EventParam("ideaId", ethereum.Value.fromString(ideaId))
  let newTextParam = new ethereum.EventParam("text", ethereum.Value.fromString(newText))

  updateIdeaTextEvent.parameters.push(campaignIdParam)
  updateIdeaTextEvent.parameters.push(ideaIdParam)
  updateIdeaTextEvent.parameters.push(newTextParam)

  return updateIdeaTextEvent
}

// @ts-ignore
export function createUpdateIdeaTypeEvent(campaignId: u32, ideaId: string, newType: u32): UpdateIdeaTypeEvent {
  let updateIdeaTextEvent = changetype<UpdateIdeaTypeEvent>(newMockEvent())
  updateIdeaTextEvent.parameters = new Array()

  let campaignIdParam = new ethereum.EventParam("campaignId", ethereum.Value.fromI32(campaignId))
  let ideaIdParam = new ethereum.EventParam("ideaId", ethereum.Value.fromString(ideaId))
  let newTypeParam = new ethereum.EventParam("ideaType", ethereum.Value.fromI32(newType))

  updateIdeaTextEvent.parameters.push(campaignIdParam)
  updateIdeaTextEvent.parameters.push(ideaIdParam)
  updateIdeaTextEvent.parameters.push(newTypeParam)

  return updateIdeaTextEvent
}

// @ts-ignore
export function createUpdateIdeaParentEvent(campaignId: u32, ideaId: string, newParent: string): UpdateIdeaParentEvent {
  let updateIdeaParentEvent = changetype<UpdateIdeaParentEvent>(newMockEvent())
  updateIdeaParentEvent.parameters = new Array()

  let campaignIdParam = new ethereum.EventParam("campaignId", ethereum.Value.fromI32(campaignId))
  let ideaIdParam = new ethereum.EventParam("ideaId", ethereum.Value.fromString(ideaId))
  let newParentParam = new ethereum.EventParam("parentId", ethereum.Value.fromString(newParent))

  updateIdeaParentEvent.parameters.push(campaignIdParam)
  updateIdeaParentEvent.parameters.push(ideaIdParam)
  updateIdeaParentEvent.parameters.push(newParentParam)

  return updateIdeaParentEvent
}

// @ts-ignore
export function createDeleteIdeaEvent(campaignId: u32, ideaId: string): DeleteIdeaEvent {
  let deleteIdeaEvent = changetype<DeleteIdeaEvent>(newMockEvent())
  deleteIdeaEvent.parameters = new Array()

  let campaignIdParam = new ethereum.EventParam("campaignId", ethereum.Value.fromI32(campaignId))
  let ideaIdParam = new ethereum.EventParam("ideaId", ethereum.Value.fromString(ideaId))

  deleteIdeaEvent.parameters.push(campaignIdParam)
  deleteIdeaEvent.parameters.push(ideaIdParam)

  return deleteIdeaEvent
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
