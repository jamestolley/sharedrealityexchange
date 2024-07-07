"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GQL_CAMPAIGNS_list } from "../_helpers/Queries";
import { CampaignDisplay } from "./CampaignDisplay";
import { useQuery } from "@apollo/client";
import getErrorMessage from "~~/components/GetErrorMessage";

type Campaign = {
  campaignId: string;
  owner: string;
  title: string;
  claim: string;
  description: string;
  amountCollected: bigint;
  amountWithdrawn: bigint;
};

export const CampaignsList = () => {
  const [pageSize, setPageSize] = useState(25);
  const [pageNum, setPageNum] = useState(0);

  const { loading, error, data, refetch } = useQuery(GQL_CAMPAIGNS_list(), {
    variables: {
      limit: pageSize,
      offset: pageNum * pageSize,
    },
    pollInterval: 5000,
  });

  useEffect(() => {
    if (error !== undefined && error !== null) console.log("GQL_FUNDRUNS_For_Display Query Error: ", error);
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
    const campaignsList = data.campaigns;
    return (
      <>
        {campaignsList?.map((campaign: Campaign) => (
          <div
            key={campaign.campaignId.toString()}
            className="flex flex-col gap-2 p-2 m-4 border shadow-xl border-base-300 bg-base-200 sm:rounded-lg"
          >
            <CampaignDisplay
              refetch={refetch}
              campaignId={Number(campaign.campaignId)}
              owner={campaign.owner}
              title={campaign.title}
              claim={campaign.claim}
              description={campaign.description}
              amountCollected={campaign.amountCollected}
              amountWithdrawn={campaign.amountWithdrawn}
            />
            <div className="flex justify-between">
              <div>
                <Link href={`/crowdfund/vaults/${campaign.campaignId}`} passHref className="btn btn-primary">
                  <div className="tooltip tooltip-primary" data-tip="View Proposals in the Vault">
                    View Vault
                  </div>
                </Link>
              </div>

              <div>
                <Link href={`/campaigns/${campaign.campaignId}`} passHref className="btn btn-primary">
                  <div className="tooltip tooltip-primary" data-tip="donate...">
                    View Campaign
                  </div>
                </Link>
              </div>
            </div>
          </div>
        ))}
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
