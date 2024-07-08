"use client";

import { useEffect, useState } from "react";
import { GQL_FOLLOWS_by_campaignid } from "../_helpers/Queries";
import { useQuery } from "@apollo/client";
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

type CampaignsFollowsListProps = {
  campaign: Campaign;
};

type Follow = {
  id: string;
  user: string;
  campaign: Campaign;
  createdAt: number;
};

export const CampaignsFollowsList = ({ campaign }: CampaignsFollowsListProps) => {
  const [pageSize, setPageSize] = useState(25);
  const [pageNum, setPageNum] = useState(0);

  const { loading, error, data } = useQuery(GQL_FOLLOWS_by_campaignid(), {
    variables: {
      limit: pageSize,
      offset: pageNum * pageSize,
      // all lowercase campaignid means the campaign's "id" property, not "campaignId"
      campaignid: campaign.id,
    },
    pollInterval: 0,
  });

  useEffect(() => {
    if (error !== undefined && error !== null) console.log("GQL_WITHDRAWALS_by_campaignid Query Error: ", error);
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
    const followsList = data.follows;
    // console.log("followsList", followsList);
    return (
      <>
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            {/* head */}
            <thead>
              <tr>
                <th>Date</th>
                <th>User</th>
              </tr>
            </thead>
            <tbody>
              {followsList?.map((follow: Follow) => {
                // console.log("follow", follow)
                return (
                  <tr key={follow.id} className="hover">
                    <td>{new Date(follow.createdAt * 1000).toLocaleString()}</td>
                    <td>
                      <Address disableAddressLink={true} address={follow.user} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
