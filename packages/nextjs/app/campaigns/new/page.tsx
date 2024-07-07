import { CreateCampaign } from "../_components/CreateCampaign";
import { NextPage } from "next";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Create Campaign",
  description: "Create a campaign to Crowdfund the truth",
});

const NewCampaign: NextPage = () => {
  return (
    <>
      <CreateCampaign />
    </>
  );
};

export default NewCampaign;
