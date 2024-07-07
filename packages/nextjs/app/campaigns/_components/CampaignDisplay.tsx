import Link from "next/link";
// import { FollowToggle } from "../_components/social/FollowToggle";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { EditableTextArea, EditableTextField } from "~~/components/EditableText";
import getErrorMessage from "~~/components/GetErrorMessage";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

interface CampaignDisplayProps {
  refetch: () => void;
  campaignId: number;
  owner: string;
  title: string;
  claim: string;
  description: string;
  amountCollected: bigint;
  amountWithdrawn: bigint;
}

export const CampaignDisplay = (campaign: CampaignDisplayProps) => {
  const { writeContractAsync } = useScaffoldWriteContract("SharedRealityExchange");

  const userIsOwner = useAccount().address?.toLowerCase() == campaign.owner.toLowerCase();

  const onFieldUpdate = async (field: "owner" | "title" | "claim" | "description", text: string) => {
    // update the blockchain if:
    //  text is different from the current value
    if (campaign[field] == text.trim()) {
      return;
    }

    //  we are not already pending an update
    // if (isPending) {
    //   return;
    // }
    // actually, it doesn't matter if there is an update pending.
    // We can do two at the same time

    // if they are not the owner...
    if (!userIsOwner) {
      notification.error("You are not authorized to make changes to this campaign.", {
        position: "top-right",
        duration: 6000,
      });
      return;
    }

    let functionName:
      | "updateCampaignOwner"
      | "updateCampaignTitle"
      | "updateCampaignClaim"
      | "updateCampaignDescription";
    switch (field) {
      case "owner":
        functionName = "updateCampaignOwner";
        break;
      case "title":
        functionName = "updateCampaignTitle";
        break;
      case "claim":
        functionName = "updateCampaignClaim";
        break;
      case "description":
        functionName = "updateCampaignDescription";
        break;
    }

    const args: readonly [number, string] = [campaign.campaignId, field == "owner" ? campaign.owner : text.trim()];

    try {
      await writeContractAsync(
        {
          functionName: functionName,
          args: args,
        },
        {
          onBlockConfirmation: txnReceipt => {
            console.log("📦 Transaction blockHash", txnReceipt);
            const legible_field: string = functionName.replace("updateCampaign", "");
            notification.success(`${legible_field} updated`, { position: "top-right", duration: 6000 });
            setTimeout(campaign.refetch, 2000);
          },
        },
      );
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      notification.error(message, { position: "top-right", duration: 6000 });
    }
  };

  return (
    <div>
      <div className="flex justify-between">
        <Link href={`/social-management/${campaign.campaignId}`} passHref className="btn btn-primary btn-sm">
          Manage Social Page
        </Link>
        <Link href={`/conversation/${campaign.campaignId}`} passHref className="btn btn-primary btn-sm">
          View Conversation
        </Link>
        {/* <FollowToggle campaignId={campaign.campaignId} /> */}
      </div>

      <label className="text-lg font-bold underline">Owner</label>
      <p className="mt-0 mb-1 text-xl">
        {userIsOwner ? (
          <EditableTextField
            onUpdate={(text: string) => onFieldUpdate("owner", text)}
            initialText={campaign.owner}
            className="w-full"
          />
        ) : (
          campaign.owner
        )}
      </p>

      {/* <label className="text-lg font-bold underline">Title</label>
      <p className="mt-0 mb-1 text-xl">{userIsOwner ? <EditableTextField onUpdate={(text: string) => onFieldUpdate('title', text)} initialText={campaign.title} className="w-full" /> : campaign.title}</p> */}

      <label className="text-lg font-bold underline">Claim</label>
      <p className="mt-0 mb-1 text-xl">
        {userIsOwner ? (
          <EditableTextField
            onUpdate={(text: string) => onFieldUpdate("claim", text)}
            initialText={campaign.claim}
            className="w-full"
          />
        ) : (
          campaign.claim
        )}
      </p>

      <label className="text-lg font-bold underline">Description</label>
      <p className="mt-0 mb-1 text-xl">
        {userIsOwner ? (
          <EditableTextArea
            onUpdate={(text: string) => onFieldUpdate("description", text)}
            initialText={campaign.description}
            className="w-full"
          />
        ) : (
          campaign.description
        )}
      </p>

      <div className="justify-between mt-5 lg:mt-0 lg:px-4 lg:flex">
        <div className="flex flex-col">
          <label className="text-lg font-bold underline">Ether Donated</label>
          <p className="mt-0 mb-1 text-xl break-all">{formatEther(campaign.amountCollected)}</p>
        </div>
      </div>

      <div className="justify-between lg:px-4 lg:flex">
        <div className="flex flex-col">
          <label className="text-lg font-bold underline">Ether Withdrawn</label>
          <p className="mt-0 mb-1 text-xl break-all">{formatEther(campaign.amountWithdrawn)}</p>
        </div>
      </div>
    </div>
  );
};
