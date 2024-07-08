"use client";

import { useEffect, useState } from "react";
import { GQL_CAMPAIGNUPDATES_by_campaignId } from "../_helpers/Queries";
import { CampaignUpdateForm } from "./CampaignUpdateForm";
import { useQuery } from "@apollo/client";
import { useAccount } from "wagmi";
import getErrorMessage from "~~/components/GetErrorMessage";
import { Address } from "~~/components/scaffold-eth";

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

type CampaignsUpdatesListProps = {
  campaign: Campaign;
  refetch: () => void;
};

type CampaignUpdate = {
  id: string;
  author: string;
  title: string;
  content: string;
  createdAt: number;
};

export const CampaignsUpdatesList = ({ campaign, refetch }: CampaignsUpdatesListProps) => {
  const [pageSize, setPageSize] = useState(25);
  const [pageNum, setPageNum] = useState(0);

  const account = useAccount();
  const userIsOwner = account?.address?.toLowerCase() == campaign.owner.toLowerCase();

  // console.log("userIsOwner", userIsOwner, account.address, campaign.owner)

  const { loading, error, data } = useQuery(GQL_CAMPAIGNUPDATES_by_campaignId(campaign.campaignId), {
    variables: {
      limit: pageSize,
      offset: pageNum * pageSize,
      // campaignId: campaign.campaignId,
    },
    pollInterval: 0,
  });

  useEffect(() => {
    if (error !== undefined && error !== null) console.log("GQL_CAMPAIGNUPDATES_by_campaignId Query Error: ", error);
  }, [error]);

  if (loading) {
    return (
      <div className="flex flex-col gap-2 p-2 m-4 mx-auto border shadow-xl border-base-300 bg-base-200 sm:rounded-lg">
        <span className="loading loading-spinner loading-sm"></span>
      </div>
    );
  } else if (error) {
    const message = getErrorMessage(error);
    return (
      <div className="flex flex-col gap-2 p-2 m-4 mx-auto border shadow-xl border-base-300 bg-base-200 sm:rounded-lg">
        <span className="text-srered">An error has occurred: {message}. Refresh the page or try again later.</span>
      </div>
    );
  } else {
    // console.log("data: ", data);
    const updatesList = data.campaignUpdates;
    // console.log("updatesList", updatesList);
    return (
      <>
        <div className="overflow-x-auto">
          {userIsOwner && <CampaignUpdateForm campaignId={campaign.campaignId} refetch={refetch} />}
          <div className="bg-base-200 min-h-screen">
            {updatesList.map((update: CampaignUpdate) => {
              // console.log("donation", donation)
              return (
                <div key={update.id} className="text-left w-full mx-8">
                  <div className="w-full mx-8">
                    <p>{new Date(update.createdAt * 1000).toLocaleString()}</p>
                    <p>
                      <Address disableAddressLink={true} address={update.author} />
                    </p>
                    <h1 className="text-3xl font-bold">{update.title}</h1>
                    <p className="py-6">{update.content}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex justify-center gap-3 mb-3">
          <span className="my-auto text-lg">Page {pageNum + 1}</span>
          <select
            className="px-4 py-2 text-xl bg-primary"
            onChange={event => setPageSize(parseInt(event.target.value))}
            value={pageSize.toString()}
          >
            <option value="25">Show 25</option>
            <option value="10">Show 10</option>
            <option value="1">Show 1</option>
          </select>
        </div>
        <div className="flex justify-between">
          <button disabled={!pageNum} className="btn btn-primary" onClick={() => setPageNum(prev => prev - 1)}>
            Previous
          </button>
          <button className="btn btn-primary" onClick={() => setPageNum(prev => prev + 1)}>
            Next
          </button>
        </div>
      </>
    );
  }
};
