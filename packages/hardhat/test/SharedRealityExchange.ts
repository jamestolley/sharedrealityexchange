import { expect } from "chai";
import { ethers } from "hardhat";
import { SharedRealityExchange } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

const IdeaType: {
  Claim: 0;
  Pro: 1;
  Con: 2;
  Part: 3;
} = {
  Claim: 0,
  Pro: 1,
  Con: 2,
  Part: 3,
};

const SpecialistGroupStatus: {
  Active: 0;
  Inactice: 1;
  Deleted: 2;
} = {
  Active: 0,
  Inactice: 1,
  Deleted: 2,
};

describe("SharedRealityExchange", function () {
  // We define a fixture to reuse the same setup in every test.

  let sharedRealityExchange: SharedRealityExchange;
  let deployer: HardhatEthersSigner;
  let nonOwner: HardhatEthersSigner;
  const ethDonated = ethers.parseEther("0.001");
  const ethWithdrawn = ethers.parseEther("0.0001");

  before(async () => {
    [deployer, nonOwner] = await ethers.getSigners();
    const sharedRealityExchangeFactory = await ethers.getContractFactory("SharedRealityExchange");
    sharedRealityExchange = (await sharedRealityExchangeFactory.deploy()) as SharedRealityExchange;
    await sharedRealityExchange.waitForDeployment();
  });

  describe("Core campaign features", function () {
    it("Should create a campaign, emit an event, and be fetchable by _campaignId", async function () {
      let campaignId;
      const title = "title";
      const claim = "claim";

      await expect((campaignId = await sharedRealityExchange.createCampaign("title", "claim", "description")))
        .to.emit(sharedRealityExchange, "CampaignCreated")
        .withArgs(0, deployer.address, title, claim, "description");

      expect(campaignId.value).to.equal(0);

      const campaign = await sharedRealityExchange.campaigns(0);

      expect(campaign[0]).to.equal(deployer);
      expect(campaign[1]).to.equal(title);
      expect(campaign[2]).to.equal(claim);
      expect(campaign[3]).to.equal(0n);
      expect(campaign[4]).to.equal(0n);
    });

    it("Should require title, claim, and description", async function () {
      await expect(sharedRealityExchange.createCampaign("", "claim", "description")).to.be.revertedWith(
        "Title, Claim and Description are all required fields.",
      );

      await expect(sharedRealityExchange.createCampaign("title", "", "description")).to.be.revertedWith(
        "Title, Claim and Description are all required fields.",
      );

      await expect(sharedRealityExchange.createCampaign("title", "claim", "")).to.be.revertedWith(
        "Title, Claim and Description are all required fields.",
      );
    });

    it("Should accept a donation", async function () {
      const comment = "This is the donation comment";
      const options = { value: ethDonated };
      await expect(await sharedRealityExchange.donateToCampaign(0, comment, options))
        .to.emit(sharedRealityExchange, "Donation")
        .withArgs(0, deployer, ethDonated, comment);

      const campaign = await sharedRealityExchange.campaigns(0);
      // console.log(campaign);
      expect(campaign[0]).to.equal(deployer);
      expect(campaign[1]).to.equal("title");
      expect(campaign[2]).to.equal("claim");
      expect(campaign[3]).to.equal(ethDonated);
      expect(campaign[4]).to.equal(0n);
    });

    it("Should reject a withdrawl from a non-owner", async function () {
      const nonOwnerContract = sharedRealityExchange.connect(nonOwner);
      const comment = "This is the failed withdrawal comment";

      expect(
        nonOwnerContract.withdrawFromCampaign(0, ethWithdrawn, comment).then(tx => {
          return tx.wait().then(
            () => {
              // console.log("This should have failed!!");
              expect(true).to.equal(false);
            },
            () => {
              expect(true).to.equal(true);
            },
          );
        }),
      );
    });

    it("Should allow a withdrawl from the owner", async function () {
      const comment = "This is the successful withdrawal comment";

      await expect(await sharedRealityExchange.withdrawFromCampaign(0, ethWithdrawn, comment))
        .to.emit(sharedRealityExchange, "Withdrawal")
        .withArgs(0, deployer, ethWithdrawn, comment);

      const campaign = await sharedRealityExchange.campaigns(0);
      // console.log(campaign);
      // console.log([deployer, "title", "claim", ethDonated, ethWithdrawn])
      expect(campaign[0]).to.equal(deployer);
      expect(campaign[1]).to.equal("title");
      expect(campaign[2]).to.equal("claim");
      expect(campaign[3]).to.equal(ethDonated);
      expect(campaign[4]).to.equal(ethWithdrawn);
    });

    it("Should allow the creation of an idea", async function () {
      const parentId = "0x0000000000000000000000000000000000000000";
      const ideaType = IdeaType.Pro;
      const text = "This is the test idea";

      await expect(await sharedRealityExchange.createIdea(0, parentId, ideaType, text, 0, 0))
        .to.emit(sharedRealityExchange, "CreateIdea")
        // campaignId, parentId, ideaType (claim == 0), claimText
        .withArgs(0, 0, parentId, ideaType, text, 0, 0);
    });

    // Cannot test the updating or deleting of an idea because we cannot get the ideaId from the contract
    // We can test this in the graph

    it("Should reject an update from a non-owner", async function () {
      const nonOwnerContract = sharedRealityExchange.connect(nonOwner);
      const title = "This is the failed update title";
      const comment = "This is the failed update comment";

      expect(
        nonOwnerContract.createCampaignUpdate(0, title, comment).then(tx => {
          return tx.wait().then(
            () => {
              // console.log("This should have failed!!");
              expect(true).to.equal(false);
            },
            () => {
              expect(true).to.equal(true);
            },
          );
        }),
      );
    });

    it("Should allow an update from the owner", async function () {
      const title = "This is the successful update title";
      const comment = "This is the successful update comment";

      await expect(await sharedRealityExchange.createCampaignUpdate(0, title, comment))
        .to.emit(sharedRealityExchange, "CampaignUpdate")
        .withArgs(0, deployer, title, comment);
    });

    it("Should reject field updates from a non-owner", async function () {
      const nonOwnerContract = sharedRealityExchange.connect(nonOwner);

      expect(
        nonOwnerContract.updateCampaignTitle(0, "invalid call title").then(tx => {
          return tx.wait().then(
            () => {
              // console.log("This should have failed!!");
              expect(true).to.equal(false);
            },
            () => {
              expect(true).to.equal(true);
            },
          );
        }),
      );

      expect(
        nonOwnerContract.updateCampaignClaim(0, "invalid call claim").then(tx => {
          return tx.wait().then(
            () => {
              // console.log("This should have failed!!");
              expect(true).to.equal(false);
            },
            () => {
              expect(true).to.equal(true);
            },
          );
        }),
      );

      expect(
        nonOwnerContract.updateCampaignDescription(0, "invalid call description").then(tx => {
          return tx.wait().then(
            () => {
              // console.log("This should have failed!!");
              expect(true).to.equal(false);
            },
            () => {
              expect(true).to.equal(true);
            },
          );
        }),
      );
    });

    it("Should allow field updates from the owner", async function () {
      await expect(await sharedRealityExchange.updateCampaignTitle(0, "new title"))
        .to.emit(sharedRealityExchange, "CampaignTitleUpdated")
        .withArgs(0, "new title");

      await expect(await sharedRealityExchange.updateCampaignClaim(0, "new claim"))
        .to.emit(sharedRealityExchange, "CampaignClaimUpdated")
        .withArgs(0, "new claim");

      await expect(await sharedRealityExchange.updateCampaignDescription(0, "new description"))
        .to.emit(sharedRealityExchange, "CampaignDescriptionUpdated")
        .withArgs(0, "new description");

      await expect(await sharedRealityExchange.updateCampaignOwner(0, "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"))
        .to.emit(sharedRealityExchange, "CampaignOwnerUpdated")
        .withArgs(0, "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9");

      const campaign = await sharedRealityExchange.campaigns(0);
      // console.log(campaign);
      // console.log([deployer, "title", "claim", ethDonated, ethWithdrawn])
      expect(campaign[0]).to.equal("0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9");
      expect(campaign[1]).to.equal("new title");
      expect(campaign[2]).to.equal("new claim");
      expect(campaign[3]).to.equal(ethDonated);
      expect(campaign[4]).to.equal(ethWithdrawn);
    });

    describe("Deployment", function () {
      it("Should have the right owner", async function () {
        expect(await sharedRealityExchange.owner()).to.equal(deployer.address);
      });
    });

    describe("Following and unfollowing", function () {
      it("Should be able to follow", async function () {
        await expect(await sharedRealityExchange.follow(0))
          .to.emit(sharedRealityExchange, "Follow")
          .withArgs(0, deployer.address);
      });

      it("Should be able to unfollow", async function () {
        await expect(await sharedRealityExchange.unfollow(0))
          .to.emit(sharedRealityExchange, "Unfollow")
          .withArgs(0, deployer.address);
      });
    });

    describe("Specialist groups", function () {
      it("Should be able to create one", async function () {
        let groupId;
        const name = "name";
        const specification = "specification";

        await expect(
          (groupId = await sharedRealityExchange.createSpecialistGroup(deployer.address, name, specification)),
        )
          .to.emit(sharedRealityExchange, "CreateSpecialistGroup")
          .withArgs(0, deployer.address, name, specification);

        expect(groupId.value).to.equal(0);

        const group = await sharedRealityExchange.specialistGroups(groupId.value);

        expect(group[0]).to.equal(deployer);
        expect(group[1]).to.equal(SpecialistGroupStatus.Active);
        expect(group[2]).to.equal(name);
        expect(group[3]).to.equal(specification);

        // owner of the group must be a group member
        expect(await sharedRealityExchange.specialistGroupMembers(0, deployer.address)).to.equal(true);
      });

      it("Should be able to add, remove, and vouch for members", async function () {
        const comments = "comments";
        const url = "http://example.com";

        expect(await sharedRealityExchange.specialistGroupMembers(0, nonOwner)).to.equal(false);

        await expect(await sharedRealityExchange.addSpecialistToGroup(0, nonOwner, comments, url))
          .to.emit(sharedRealityExchange, "SpecialistAddedToGroup")
          .withArgs(0, deployer, nonOwner, comments, url);

        expect(await sharedRealityExchange.specialistGroupMembers(0, nonOwner)).to.equal(true);

        await expect(await sharedRealityExchange.vouchForSpecialist(0, nonOwner, comments, url))
          .to.emit(sharedRealityExchange, "VouchForSpecialist")
          .withArgs(0, deployer, nonOwner, comments, url);

        await expect(await sharedRealityExchange.removeSpecialistFromGroup(0, nonOwner, comments, url))
          .to.emit(sharedRealityExchange, "SpecialistRemovedFromGroup")
          .withArgs(0, deployer, nonOwner, comments, url);

        expect(await sharedRealityExchange.specialistGroupMembers(0, nonOwner)).to.equal(false);
      });

      it("Should be able to add it to and remove it from a campaign", async function () {
        const comments = "comments";

        expect(await sharedRealityExchange.campaignSpecialistGroups(0, 0)).to.equal(false);

        await expect(await sharedRealityExchange.addSpecialistGroupToCampaign(0, 0, comments))
          .to.emit(sharedRealityExchange, "SpecialistGroupAddedToCampaign")
          .withArgs(0, 0, deployer, comments);

        expect(await sharedRealityExchange.campaignSpecialistGroups(0, 0)).to.equal(true);

        await expect(await sharedRealityExchange.removeSpecialistGroupFromCampaign(0, 0, comments))
          .to.emit(sharedRealityExchange, "SpecialistGroupRemovedFromCampaign")
          .withArgs(0, 0, deployer, comments);

        expect(await sharedRealityExchange.campaignSpecialistGroups(0, 0)).to.equal(false);
      });

      it("Should be able to edit the name, status, specification, and owner", async function () {
        const newName = "new name";
        const newSpec = "new spec";

        await expect(await sharedRealityExchange.updateSpecialistGroupName(0, newName))
          .to.emit(sharedRealityExchange, "SpecialistGroupNameUpdated")
          .withArgs(0, newName);

        await expect(await sharedRealityExchange.updateSpecialistGroupStatus(0, 1))
          .to.emit(sharedRealityExchange, "SpecialistGroupStatusUpdated")
          .withArgs(0, 1);

        await expect(await sharedRealityExchange.updateSpecialistGroupSpecification(0, newSpec))
          .to.emit(sharedRealityExchange, "SpecialistGroupSpecificationUpdated")
          .withArgs(0, newSpec);

        await expect(await sharedRealityExchange.updateSpecialistGroupOwner(0, nonOwner))
          .to.emit(sharedRealityExchange, "SpecialistGroupOwnerUpdated")
          .withArgs(0, nonOwner);

        const group = await sharedRealityExchange.specialistGroups(0);

        expect(group[0]).to.equal(nonOwner);
        expect(group[1]).to.equal(SpecialistGroupStatus.Inactice);
        expect(group[2]).to.equal(newName);
        expect(group[3]).to.equal(newSpec);
      });

      // it("Should be able to delete", async function () {

      //   const group = await sharedRealityExchange.specialistGroups(0);

      //   expect(group[0]).to.equal(nonOwner);
      //   expect(group[1]).to.equal(SpecialistGroupStatus.Active);
      //   expect(group[2]).to.equal(name);
      //   expect(group[3]).to.equal(specification);

      //   await expect(await sharedRealityExchange.updateSpecialistGroupName(0, newName))
      //     .to.emit(sharedRealityExchange, "SpecialistGroupNameUpdated")
      //     .withArgs(0, newName);

      //   await expect(await sharedRealityExchange.updateSpecialistGroupSpecification(0, newSpec))
      //     .to.emit(sharedRealityExchange, "SpecialistGroupSpecificationUpdated")
      //     .withArgs(0, newSpec);

      //   await expect(await sharedRealityExchange.updateSpecialistGroupOwner(0, nonOwner))
      //     .to.emit(sharedRealityExchange, "SpecialistGroupOwnerUpdated")
      //     .withArgs(0, nonOwner);

      //   const group2 = await sharedRealityExchange.specialistGroups(0);

      //   expect(group2[0]).to.equal(nonOwner);
      //   expect(group2[1]).to.equal(SpecialistGroupStatus.Active);
      //   expect(group2[2]).to.equal(newName);
      //   expect(group2[3]).to.equal(newSpec);
      // });
    });
  });
});
