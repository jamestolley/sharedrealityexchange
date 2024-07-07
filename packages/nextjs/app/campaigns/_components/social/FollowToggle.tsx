import { useEffect } from "react";
import { GQL_SOCIAL_FOLLOWERS_by_campaignId_and_address } from "../../_helpers/Queries";
import { FollowButton } from "./FollowButton";
import { UnfollowButton } from "./UnfollowButton";
import { useQuery } from "@apollo/client";
import { useAccount } from "wagmi";

interface FollowToggleProps {
  campaignId: number;
}

export const FollowToggle = ({ campaignId }: FollowToggleProps) => {
  const userAccount = useAccount();

  const { error, data } = useQuery(GQL_SOCIAL_FOLLOWERS_by_campaignId_and_address(), {
    variables: {
      fundRunId: campaignId,
      user: userAccount.address,
    },
    pollInterval: 0,
  });

  useEffect(() => {
    if (error !== undefined && error !== null)
      console.log("GQL_SOCIAL_FOLLOWERS_By_FundRunId_and_Address Query Error: ", error);
  }, [error]);

  if (data && data.campaigns && data.campaigns.length) {
    const campaign = data.campaigns[0];

    if (campaign.followers?.length > 0) {
      return <UnfollowButton campaignId={campaignId} />;
    } else {
      return <FollowButton campaignId={campaignId} />;
    }
  } else {
    return <div>No follow button to show</div>;
  }
};
