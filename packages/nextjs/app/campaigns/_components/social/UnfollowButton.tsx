import getErrorMessage from "~~/components/GetErrorMessage";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

interface UnfollowButtonProps {
  campaignId: number;
  setFollowing: (following: boolean) => void;
}

export const UnfollowButton = ({ campaignId, setFollowing }: UnfollowButtonProps) => {
  const { writeContractAsync, isPending } = useScaffoldWriteContract("SharedRealityExchange");

  const handleClick = async () => {
    try {
      await writeContractAsync(
        {
          functionName: "unfollow",
          args: [campaignId],
        },
        {
          onBlockConfirmation: txnReceipt => {
            console.log("📦 Transaction blockHash", txnReceipt);
            setFollowing(false);
            notification.success("You have unfollowed this campaign.", { position: "top-right", duration: 6000 });
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
      {isPending ? <span className="loading loading-spinner loading-sm"></span> : "Unfollow"}
    </button>
  );
};
