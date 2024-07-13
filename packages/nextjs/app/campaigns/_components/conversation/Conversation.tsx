import { FlowChart } from "./FlowChart";

type CampaignData = {
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

type ConversationProps = {
  campaign: CampaignData;
  refetch: () => void;
  ideas: Idea[];
};

export function Conversation({ campaign, ideas, refetch }: ConversationProps) {
  return (
    <div>
      <FlowChart campaign={campaign} ideas={ideas} refetch={refetch} />
    </div>
  );
}
