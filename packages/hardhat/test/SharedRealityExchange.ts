import { expect } from "chai";
import { ethers } from "hardhat";
import { SharedRealityExchange } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

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

      // console.log(campaign)
      // console.log({campaign})

      const campaign = await sharedRealityExchange.campaigns(0);
      // console.log(campaign);
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
      const options = { value: ethDonated };
      expect(await sharedRealityExchange.donateToCampaign(0, options));

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

      expect(
        nonOwnerContract.withdrawFromCampaign(0, ethWithdrawn).then(tx => {
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
      expect(await sharedRealityExchange.withdrawFromCampaign(0, ethWithdrawn));

      const campaign = await sharedRealityExchange.campaigns(0);
      // console.log(campaign);
      // console.log([deployer, "title", "claim", ethDonated, ethWithdrawn])
      expect(campaign[0]).to.equal(deployer);
      expect(campaign[1]).to.equal("title");
      expect(campaign[2]).to.equal("claim");
      expect(campaign[3]).to.equal(ethDonated);
      expect(campaign[4]).to.equal(ethWithdrawn);
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
      console.log(campaign);
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
  });
});
