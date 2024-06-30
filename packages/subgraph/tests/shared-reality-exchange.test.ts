import { describe, test, assert, beforeAll } from "matchstick-as";
import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { Greeting, Sender, Campaign, Donation, Withdrawal, OwnershipTransferred } from "../generated/schema";

describe("Shared Reality Exchange", () => {
    beforeAll(() => {
        // Mocking the Campaign

        // type Campaign @entity {
        //     id: Bytes!
        //     campaignId: Int! # uint32
        //     owner: Bytes! # address
        //     title: String! # string
        //     claim: String! # string
        //     description: String! # string
        //     amountCollected: BigInt! # uint256
        //     amountWithdrawn: BigInt! # uint256
        //     blockNumber: BigInt!
        //     blockTimestamp: BigInt!
        //     transactionHash: Bytes!
        //   }
        let campaign = new Campaign(Bytes.fromHexString("0"));
        campaign.campaignId = BigInt.fromI32(0);
        campaign.owner = Bytes.fromHexString(
            "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
        );
        campaign.title = "title";
        campaign.claim = "claim";
        campaign.description = "description";
        campaign.amountCollected = BigInt.fromI32(0);
        campaign.amountWithdrawn = BigInt.fromI32(0);
        campaign.blockNumber = BigInt.fromI32(234567);
        campaign.blockTimestamp = BigInt.fromI32(123456789);
        campaign.transactionHash = Bytes.fromHexString(
            "0x1909fcb0b41989e28308afcb0cf55adb6faba28e14fcbf66c489c69b8fe95dd7"
        );
        campaign.save();

        // Mocking Donation

        // type Donation @entity {
        //     id: Bytes!
        //     campaignId: Int! # uint32
        //     donor: Bytes! # address
        //     amount: BigInt! # uint256
        //     blockNumber: BigInt!
        //     blockTimestamp: BigInt!
        //     transactionHash: Bytes!
        //     campaign: Campaign
        // }

        let donation = new Donation(Bytes.fromHexString("0"));
        donation.campaignId = campaign.campaignId;
        donation.amount = BigInt.fromI32(1000);
        donation. = "Building COOL Apps!";
        donation.premium = false;
        donation.transactionHash =
            "0x1909fcb0b41989e28308afcb0cf55adb6faba28e14fcbf66c489c69b8fe95dd6";
        donation.save();

        // Mocking Withdrawl

        // type Withdrawal @entity(immutable: true) {
        //     id: Bytes!
        //     campaignId: Int! # uint32
        //     owner: Bytes! # address
        //     amount: BigInt! # uint256
        //     blockNumber: BigInt!
        //     blockTimestamp: BigInt!
        //     transactionHash: Bytes!
        // }

        let greeting = new Greeting(
            "0x1909fcb0b41989e28308afcb0cf55adb6faba28e14fcbf66c489c69b8fe95dd6"
        );
        greeting.sender = sender.id; // Linking Greeting to Sender by ID
        greeting.createdAt = BigInt.fromI32(1709849870);
        greeting.greeting = "Building COOL Apps!";
        greeting.premium = false;
        greeting.transactionHash =
            "0x1909fcb0b41989e28308afcb0cf55adb6faba28e14fcbf66c489c69b8fe95dd6";
        greeting.value = BigInt.fromI32(0);
        greeting.save();

        // Mocking Ownership change

        // type OwnershipTransferred @entity(immutable: true) {
        //     id: Bytes!
        //     previousOwner: Bytes! # address
        //     newOwner: Bytes! # address
        //     blockNumber: BigInt!
        //     blockTimestamp: BigInt!
        //     transactionHash: Bytes!
        // }

        let greeting = new Greeting(
            "0x1909fcb0b41989e28308afcb0cf55adb6faba28e14fcbf66c489c69b8fe95dd6"
        );
        greeting.sender = sender.id; // Linking Greeting to Sender by ID
        greeting.createdAt = BigInt.fromI32(1709849870);
        greeting.greeting = "Building COOL Apps!";
        greeting.premium = false;
        greeting.transactionHash =
            "0x1909fcb0b41989e28308afcb0cf55adb6faba28e14fcbf66c489c69b8fe95dd6";
        greeting.value = BigInt.fromI32(0);
        greeting.save();
    });

    test("Greeting and Sender entities", () => {
        // Testing proper entity creation and field assertion
        let id =
            "0x1909fcb0b41989e28308afcb0cf55adb6faba28e14fcbf66c489c69b8fe95dd7";
        let senderAddress = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96046";
        let greetingText = "Building AWESOME Apps!";

        // Creating a new Sender entity for the Greeting
        let newSender = new Sender(senderAddress);
        newSender.address = Bytes.fromHexString(senderAddress);
        newSender.createdAt = BigInt.fromI32(1709859870); // A different timestamp
        newSender.greetingCount = BigInt.fromI32(2); // Updated greeting count
        newSender.save();

        // Creating a new Greeting entity
        let entity = new Greeting(id);
        entity.sender = newSender.id; // Linking to new Sender
        entity.greeting = greetingText;
        entity.createdAt = BigInt.fromI32(1709859870); // Make sure to have the correct time
        entity.premium = true; // Assuming a different scenario
        entity.transactionHash = id; // Mock transaction hash as the ID
        entity.value = BigInt.fromI32(100); // Some value
        entity.save();

        // Loading the Greeting entity and asserting its fields
        let loadedEntity = Greeting.load(id);
        assert.assertNotNull(
            loadedEntity,
            "Loaded Greeting entity should not be null"
        );
        assert.fieldEquals("Greeting", id, "sender", newSender.id);
        assert.fieldEquals("Greeting", id, "greeting", greetingText);
        assert.fieldEquals("Greeting", id, "premium", "true"); // Assuming premium is a boolean
        assert.fieldEquals("Greeting", id, "value", "100"); // Assuming value is stored as a BigInt

        // Corrected entity and field names according to the mock
        assert.entityCount("Sender", 2); // Assuming there are 2 Sender entities now
        assert.entityCount("Greeting", 2); // Assuming there are 2 Greeting entities now
    });
});
