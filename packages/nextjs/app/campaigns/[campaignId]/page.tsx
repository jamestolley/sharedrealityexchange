"use client";

import { useEffect, useState } from "react";
import { notFound, useParams, useRouter, useSearchParams } from "next/navigation";
import { CampaignDisplay } from "../_components/CampaignDisplay";
import { CampaignDonate } from "../_components/CampaignDonate";
import { CampaignsDonationsList } from "../_components/CampaignDonations";
import { CampaignsFollowsList } from "../_components/CampaignFollows";
// import { CampaignsDebug } from "../_components/CampaignDebug";
import { CampaignsUpdatesList } from "../_components/CampaignUpdates";
import { CampaignWithdraw } from "../_components/CampaignWithdraw";
import { CampaignsWithdrawalsList } from "../_components/CampaignWithdrawals";
import { Conversation } from "../_components/conversation/Conversation";
import { GQL_CAMPAIGN_by_campaignId } from "../_helpers/Queries";
import { useQuery } from "@apollo/client";
import { NextPage } from "next";
import { useAccount } from "wagmi";
import { EditableTextArea } from "~~/components/EditableText";
import getErrorMessage from "~~/components/GetErrorMessage";
import MetaHeader from "~~/components/MetaHeader";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

type CampaignType = {
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

const CampaignDetail: NextPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentTabIndex = searchParams.get("tab") ?? 0;
  const [tabIndex, setTabIndex] = useState(currentTabIndex);
  const { campaignId } = useParams<{ campaignId: string }>();

  const [updatesPageSize, setUpdatesPageSize] = useState(25);
  const [updatesPageNum, setUpdatesPageNum] = useState(0);
  const [donationsPageSize, setDonationsPageSize] = useState(25);
  const [donationsPageNum, setDonationsPageNum] = useState(0);
  const [withdrawalsPageSize, setWithdrawalsPageSize] = useState(25);
  const [withdrawalsPageNum, setWithdrawalsPageNum] = useState(0);
  const [followsPageSize, setFollowsPageSize] = useState(25);
  const [followsPageNum, setFollowsPageNum] = useState(0);
  const [updateCount, setUpdateCount] = useState(0);

  useEffect(() => {
    const getTab = searchParams.get("tab");
    if (getTab != tabIndex) {
      router.replace(`?tab=${tabIndex}`);
    }
  }, [router, searchParams, tabIndex]);

  const { writeContractAsync } = useScaffoldWriteContract("SharedRealityExchange");

  const useAccountaddress = useAccount().address?.toLowerCase();

  const { loading, error, data, refetch } = useQuery(GQL_CAMPAIGN_by_campaignId(), {
    variables: {
      campaignId: parseInt(campaignId),
      updatesPageSize: updatesPageSize,
      updatesOffset: updatesPageNum * updatesPageSize,
      donationsPageSize: donationsPageSize,
      donationsOffset: donationsPageNum * donationsPageSize,
      withdrawalsPageSize: withdrawalsPageSize,
      withdrawalsOffset: withdrawalsPageNum * withdrawalsPageSize,
      followsPageSize: followsPageSize,
      followsOffset: followsPageNum * followsPageSize,
    },
    pollInterval: 0,
  });

  if (data) {
    console.log("campaign page data", data);
  }

  if (isNaN(parseInt(campaignId))) {
    return notFound();
  }

  if (typeof campaignId === "undefined") {
    router.push("/campaigns");
  }

  let campaign: CampaignType = {
    id: "0x0",
    campaignId: -1,
    owner: "",
    title: "",
    claim: "",
    description: "",
    amountCollected: 0n,
    amountWithdrawn: 0n,
  };
  let userIsOwner = false;
  let ideas: Idea[] = [];
  if (data && data.campaigns && data.campaigns.length) {
    campaign = data.campaigns[0];
    userIsOwner = useAccountaddress == campaign.owner.toLowerCase();
    ideas = data.ideas;
  }

  const onFieldUpdate = async (field: "owner" | "title" | "claim" | "description", text: string) => {
    // return if we do not have the campaign yet
    if (!campaign) {
      return;
    }

    // update the blockchain if:
    //  text is different from the current value
    if (campaign[field] == text.trim()) {
      return;
    }

    //  we are not already pending an update
    // if (isPending) {
    //   return;
    // }
    // actually, it doesn't matter if there is an update pending.
    // We can do two at the same time

    // if they are not the owner...
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

    const args: readonly [number, string] = [campaign.campaignId, field == "owner" ? campaign.owner : text.trim()];

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
            setTimeout(refetch, 2000);
          },
        },
      );
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      notification.error(message, { position: "top-right", duration: 6000 });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-2 p-2 m-4 mx-auto border shadow-xl border-base-300 bg-base-200 sm:rounded-lg">
        <span className="loading loading-spinner loading-sm"></span>
        {/* <Spinner width="150px" height="150px" /> */}
      </div>
    );
  } else if (error) {
    return (
      <div className="flex flex-col gap-2 p-2 m-4 mx-auto border shadow-xl border-base-300 bg-base-200 sm:rounded-lg">
        <span className="text-srered">
          {error && error.message
            ? error.message
            : "Oops! There has been an unknown error. Please try reloading the page or trying again later."}
        </span>
        {/* <Spinner width="150px" height="150px" /> */}
      </div>
    );
  } else if (campaign.campaignId != -1) {
    return (
      <>
        {data && data.length && campaign && <MetaHeader title={campaign.title} />}
        <div className="flex flex-col w-full p-4 mx-auto shadow-xl mt-8 bg-secondary sm:p-7 sm:rounded-lg sm:w-4/5 lg:w-4/5">
          <div className="flex justify-center mb-5 text-3xl w-full">
            {userIsOwner ? (
              <EditableTextArea
                onUpdate={(text: string) => onFieldUpdate("title", text)}
                initialText={campaign.title}
                className="w-fit"
              />
            ) : (
              campaign.title
            )}
          </div>
          <div role="tablist" className="tabs tabs-lifted">
            <input
              type="radio"
              name="campaign_tabs"
              role="tab"
              className="tab"
              aria-label="Overview"
              defaultChecked={tabIndex == 0}
              onClick={() => setTabIndex(0)}
            />
            <div role="tabpanel" className="tab-content bg-base-100 border-base-300 rounded-box p-6">
              <div className="flex items-center justify-center">
                <div className="flex flex-col w-full gap-2 p-2 m-4 border shadow-xl border-base-300 bg-base-200 sm:rounded-lg">
                  <div>
                    <CampaignDisplay
                      refetch={refetch}
                      campaignId={campaign.campaignId}
                      owner={campaign.owner}
                      title={campaign.title}
                      claim={campaign.claim}
                      description={campaign.description}
                      amountCollected={campaign.amountCollected}
                      amountWithdrawn={campaign.amountWithdrawn}
                      follows={data.follows}
                    />
                    <CampaignDonate refetch={refetch} campaignId={campaign.campaignId} />
                    {userIsOwner && <CampaignWithdraw refetch={refetch} campaignId={campaign.campaignId} />}
                  </div>
                </div>
              </div>
            </div>
            <input
              type="radio"
              name="campaign_tabs"
              role="tab"
              className="tab"
              aria-label="Conversation"
              defaultChecked={tabIndex == 1}
              onClick={() => setTabIndex(1)}
            />
            <div role="tabpanel" className="tab-content bg-base-100 border-base-300 rounded-box p-6">
              <Conversation campaign={campaign} ideas={ideas} refetch={refetch} />
            </div>
            <input
              type="radio"
              name="campaign_tabs"
              role="tab"
              className="tab"
              aria-label="Updates"
              defaultChecked={tabIndex == 2}
              onClick={() => setTabIndex(2)}
            />
            <div role="tabpanel" className="tab-content bg-base-100 border-base-300 rounded-box p-6">
              <CampaignsUpdatesList
                loading={loading}
                refetch={refetch}
                campaignId={parseInt(campaignId)}
                userIsOwner={userIsOwner}
                updates={data.campaignUpdates}
                pageSize={updatesPageSize}
                setPageSize={setUpdatesPageSize}
                pageNum={updatesPageNum}
                setPageNum={setUpdatesPageNum}
                updateCount={updateCount}
                setUpdateCount={setUpdateCount}
              />
            </div>
            <input
              type="radio"
              name="campaign_tabs"
              role="tab"
              className="tab"
              aria-label="Donations"
              defaultChecked={tabIndex == 3}
              onClick={() => setTabIndex(3)}
            />
            <div role="tabpanel" className="tab-content bg-base-100 border-base-300 rounded-box p-6">
              <CampaignsDonationsList
                loading={loading}
                donations={data.donations}
                pageSize={donationsPageSize}
                setPageSize={setDonationsPageSize}
                pageNum={donationsPageNum}
                setPageNum={setDonationsPageNum}
              />
            </div>
            <input
              type="radio"
              name="campaign_tabs"
              role="tab"
              className="tab"
              aria-label="Withdrawals"
              defaultChecked={tabIndex == 4}
              onClick={() => setTabIndex(4)}
            />
            <div role="tabpanel" className="tab-content bg-base-100 border-base-300 rounded-box p-6">
              <CampaignsWithdrawalsList
                loading={loading}
                withdrawals={data.withdrawals}
                pageSize={withdrawalsPageSize}
                setPageSize={setWithdrawalsPageSize}
                pageNum={withdrawalsPageNum}
                setPageNum={setWithdrawalsPageNum}
              />
            </div>
            <input
              type="radio"
              name="campaign_tabs"
              role="tab"
              className="tab"
              aria-label="Followers"
              defaultChecked={tabIndex == 5}
              onClick={() => setTabIndex(5)}
            />
            <div role="tabpanel" className="tab-content bg-base-100 border-base-300 rounded-box p-6">
              <CampaignsFollowsList
                loading={loading}
                follows={data.follows}
                pageSize={followsPageSize}
                setPageSize={setFollowsPageSize}
                pageNum={followsPageNum}
                setPageNum={setFollowsPageNum}
              />
            </div>
            <input
              type="radio"
              name="campaign_tabs"
              role="tab"
              className="tab"
              aria-label="Debug"
              defaultChecked={tabIndex == 6}
              onClick={() => setTabIndex(6)}
            />
            {/* <div role="tabpanel" className="tab-content bg-base-100 border-base-300 rounded-box p-6">
              <CampaignsDebug
                loading={loading}
                campaign={campaign}
              />
            </div> */}
          </div>
        </div>
      </>
    );
  } else {
    return <h1>Campaign not found</h1>;
  }
};

export default CampaignDetail;
