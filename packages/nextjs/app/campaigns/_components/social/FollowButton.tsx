import getErrorMessage from "~~/components/GetErrorMessage";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

interface FollowButtonProps {
  campaignId: number;
}

export function FollowButton({ campaignId }: FollowButtonProps) {
  const { writeContractAsync } = useScaffoldWriteContract("SharedRealityExchange");

  const handleClick = async () => {
    try {
      await writeContractAsync(
        {
          functionName: "donateToCampaign", // "follow",
          args: [campaignId],
        },
        {
          onBlockConfirmation: txnReceipt => {
            console.log("📦 Transaction blockHash", txnReceipt);
          },
        },
      );
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      notification.error(message, { position: "top-right", duration: 6000 });
    }
  };

  return (
    <button className="btn btn-primary btn-sm" onClick={handleClick} type="button">
      Follow
    </button>
  );
}
