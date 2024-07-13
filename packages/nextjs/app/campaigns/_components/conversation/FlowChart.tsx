// import { formatEther } from "viem";
// import { TransactionHash } from "~~/components/blockexplorer/TransactionHash";
// import { Address } from "~~/components/scaffold-eth";
// import { TransactionWithFunction, getTargetNetwork } from "~~/utils/scaffold-eth";
// import { TransactionsTableProps } from "~~/utils/scaffold-eth/";
import React from "react";
import ConversationTree from "./ConversationTree";
import "reactflow/dist/style.css";

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

type Idea = {
  id: string;
  campaignId: number;
  parentId: string;
  parentIndex: number;
  ideaType: number;
  text: string;
};

type FlowChartProps = {
  campaign: Campaign;
  ideas: Idea[];
  refetch: () => void;
};

export const FlowChart = ({ campaign, ideas, refetch }: FlowChartProps) => {
  return (
    <div
      className="table text-xl bg-base-100 table-zebra w-full md:table-md table-sm"
      style={{ textAlign: "center", height: "60vh", padding: 20 }}
    >
      <ConversationTree campaign={campaign} ideas={ideas} refetch={refetch} />
    </div>
  );
};
