import { useState } from "react";
import getErrorMessage from "~~/components/GetErrorMessage";
import { IntegerInput, IntegerVariant, isValidInteger } from "~~/components/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

interface CampaignProps {
  refetch: () => void;
  campaignId: number;
}

export const CampaignDonate = ({ refetch, campaignId }: CampaignProps) => {
  const [donationInput, setDonationInput] = useState("");

  const { writeContractAsync, isPending } = useScaffoldWriteContract("SharedRealityExchange");

  function handleBigIntChange(newVal: string | bigint): void {
    const _v = typeof newVal === "string" ? newVal.trim() : String(newVal).trim();
    if (_v.length === 0 || _v === "." || isValidInteger(IntegerVariant.UINT256, _v, false)) {
      setDonationInput(_v);
    }
  }

  const validateThenWrite = async () => {
    if (donationInput.trim() === "" || donationInput.trim() === ".") {
      notification.warning("Please input a valid donation amount.", { position: "top-right", duration: 6000 });
      return;
    }

    try {
      await writeContractAsync(
        {
          functionName: "donateToCampaign",
          args: [campaignId],
          value: BigInt(donationInput),
        },
        {
          onBlockConfirmation: txnReceipt => {
            console.log("📦 Transaction blockHash", txnReceipt);
            notification.success("Your donation was successful.", { position: "top-right", duration: 6000 });
            setTimeout(refetch, 2000);
          },
        },
      );
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      notification.error(message, { position: "top-right", duration: 6000 });
    }
  };

  return (
    <>
      <div className="flex gap-1 mt-5">
        <IntegerInput
          placeholder="Amount EX: 0.1"
          // className="w-3/4 input input-bordered input-accent"
          value={donationInput}
          onChange={handleBigIntChange}
        />
        <button className="w-1/4 btn btn-primary" onClick={validateThenWrite} disabled={isPending}>
          {isPending ? <span className="loading loading-spinner loading-sm"></span> : <>DONATE</>}
        </button>
      </div>
    </>
  );
};
