"use client";

import { Dispatch, SetStateAction } from "react";
import { CampaignUpdateForm } from "./CampaignUpdateForm";
import { Address } from "~~/components/scaffold-eth";

type CampaignsUpdatesListProps = {
  loading: boolean;
  campaignId: number;
  refetch: () => void;
  userIsOwner: boolean;
  updates: CampaignUpdate[];
  pageSize: number;
  setPageSize: Dispatch<SetStateAction<number>>;
  pageNum: number;
  setPageNum: Dispatch<SetStateAction<number>>;
  updateCount: number;
  setUpdateCount: Dispatch<SetStateAction<number>>;
};

type CampaignUpdate = {
  id: string;
  author: string;
  title: string;
  content: string;
  createdAt: number;
};

export const CampaignsUpdatesList = ({
  loading,
  campaignId,
  refetch,
  userIsOwner,
  updates,
  pageSize,
  setPageSize,
  pageNum,
  setPageNum,
  updateCount,
  setUpdateCount,
}: CampaignsUpdatesListProps) => {
  if (loading) {
    return (
      <div className="flex flex-col gap-2 p-2 m-4 mx-auto border shadow-xl border-base-300 bg-base-200 sm:rounded-lg">
        <span className="loading loading-spinner loading-sm"></span>
      </div>
    );
  } else {
    return (
      <>
        <div className="overflow-x-auto">
          {userIsOwner && (
            <CampaignUpdateForm
              campaignId={campaignId}
              refetch={refetch}
              updateCount={updateCount}
              setUpdateCount={setUpdateCount}
            />
          )}
          <div className="bg-base-200 min-h-screen">
            {updates.map((update: CampaignUpdate) => {
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
