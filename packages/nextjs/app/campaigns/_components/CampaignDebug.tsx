"use client";

// import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
// import { Contract, ContractCodeStatus, ContractName, contracts } from "~~/utils/scaffold-eth/contract";
import { useSharedRealityWriteContract } from "~~/hooks/useSharedRealityWriteContract";

// import { abi } from './abi'

type Campaign = {
  id: string;
  campaignId: number;
  owner: string;
  title: string;
  claim: string;
  description: string;
  amountCollected: bigint;
  amountWithdrawn: bigint;
};

type CampaignsDebugProps = {
  loading: boolean;
  campaign: Campaign;
};

// type Follow = {
//   id: string;
//   user: string;
//   createdAt: number;
// };

export const CampaignsDebug = ({ loading, campaign }: CampaignsDebugProps) => {
  const { writeSharedRealityContractAsync } = useSharedRealityWriteContract();

  const handleUpdateIdeaPosition = () => {
    writeSharedRealityContractAsync({
      functionName: "updateIdeaPosition",
      args: [0, "0x4076e5f715cf250915adf529be8c0615ef97f97c2d", -250, 250],
      callback: (success, dataOrError, variables, context) => {
        console.log(`in callback: `, success, dataOrError, variables, context);
      },
    });
  };

  const handleCreateIdea = () => {
    writeSharedRealityContractAsync({
      functionName: "createIdea",
      args: [0, "0x4076e5f715cf250915adf529be8c0615ef97f97c2d", 2, "This is a new child idea!", 250, 250],
      callback: (success, dataOrError, variables, context) => {
        console.log(`in callback: `, success, dataOrError, variables, context);
      },
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-2 p-2 m-4 mx-auto border shadow-xl border-base-300 bg-base-200 sm:rounded-lg">
        <span className="loading loading-spinner loading-sm"></span>
      </div>
    );
  } else {
    return (
      <>
        <div>
          <dl>
            {/* <dt>address</dt><dd>{deployedContract.address}</dd> */}
            {/* <dt>abi.length</dt><dd>{abi?.length}</dd> */}
          </dl>
        </div>
        <button style={{ border: "1px solid black" }} onClick={handleUpdateIdeaPosition}>
          Call {campaign.id}&apos;s updateIdeaPosition
        </button>
        <button style={{ border: "1px solid black" }} onClick={handleCreateIdea}>
          Call {campaign.id}&apos;s createIdea
        </button>
      </>
    );
  }
};
