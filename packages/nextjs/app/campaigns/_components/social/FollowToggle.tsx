"use client";

import { useState } from "react";
import { FollowButton } from "./FollowButton";
import { UnfollowButton } from "./UnfollowButton";
import { useAccount } from "wagmi";

interface FollowToggleProps {
  campaignId: number;
  follows: {
    user: string;
  }[];
}

export const FollowToggle = ({ campaignId, follows }: FollowToggleProps) => {
  // console.log("campaign.follows", follows)

  const userAccount = useAccount();

  const followForThisUser = follows.filter(follow => follow.user.toLowerCase() == userAccount.address?.toLowerCase());

  // console.log("followForThisUser", followForThisUser)

  const [following, setFollowing] = useState(followForThisUser?.length > 0);

  if (following) {
    return <UnfollowButton setFollowing={setFollowing} campaignId={campaignId} />;
  } else {
    return <FollowButton setFollowing={setFollowing} campaignId={campaignId} />;
  }
};
