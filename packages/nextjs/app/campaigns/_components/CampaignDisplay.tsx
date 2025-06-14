import { FollowToggle } from "../_components/social/FollowToggle";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { EditableTextArea, EditableTextField } from "~~/components/EditableText";
import getErrorMessage from "~~/components/GetErrorMessage";
import { Address } from "~~/components/scaffold-eth";
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
  follows: {
    user: string;
    createdAt: number;
  }[];
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

    // if they are the owner...
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

    const args: readonly [number, string] = [campaign.campaignId, text.trim()];

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

  // console.log("c.follows", campaign.follows)

  return (
    <div>
      <div style={{ textAlign: "right", marginRight: 8 }}>
        <FollowToggle campaignId={campaign?.campaignId} follows={campaign.follows} />
      </div>
      <label className="text-lg font-bold underline">Owner</label>
      <div className="mt-0 mb-1 text-xl">
        {userIsOwner ? (
          <EditableTextField
            onUpdate={(text: string) => onFieldUpdate("owner", text)}
            initialText={campaign.owner}
            className="w-full"
          />
        ) : (
          <Address size="sm" disableAddressLink={true} address={campaign.owner} />
        )}
      </div>

      {/* <label className="text-lg font-bold underline">Title</label>
      <p className="mt-0 mb-1 text-xl">{userIsOwner ? <EditableTextField onUpdate={(text: string) => onFieldUpdate('title', text)} initialText={campaign.title} className="w-full" /> : campaign.title}</p> */}

      {/* <label className="text-lg font-bold underline">Claim</label>
      <div className="mt-0 mb-1 text-xl">
        {userIsOwner ? (
          <EditableTextField
            onUpdate={(text: string) => onFieldUpdate("claim", text)}
            initialText={campaign.claim}
            className="w-full"
          />
        ) : (
          campaign.claim
        )}
      </div> */}

      <label className="text-lg font-bold underline">Description</label>
      <div className="mt-0 mb-1 text-xl">
        {userIsOwner ? (
          <EditableTextArea
            onUpdate={(text: string) => onFieldUpdate("description", text)}
            initialText={campaign.description}
            className="w-full"
          />
        ) : (
          campaign.description
        )}
      </div>

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
