"use client";

import { Dispatch, SetStateAction } from "react";
import { formatEther } from "viem";
import { Address } from "~~/components/scaffold-eth";

type CampaignsDonationsListProps = {
  loading: boolean;
  donations: Donation[];
  pageSize: number;
  setPageSize: Dispatch<SetStateAction<number>>;
  pageNum: number;
  setPageNum: Dispatch<SetStateAction<number>>;
};

type Donation = {
  id: string;
  donor: {
    id: string;
  };
  amount: bigint;
  comment: string;
  createdAt: number;
};

export const CampaignsDonationsList = ({
  loading,
  donations,
  pageSize,
  setPageSize,
  pageNum,
  setPageNum,
}: CampaignsDonationsListProps) => {
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
          <table className="table table-zebra">
            {/* head */}
            <thead>
              <tr>
                <th>Date</th>
                <th>Donor</th>
                <th>Comment</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {donations?.map((donation: Donation) => {
                // console.log("donation", donation)
                return (
                  <tr key={donation.id} className="hover">
                    <td>{new Date(donation.createdAt * 1000).toLocaleString()}</td>
                    <td>
                      <Address disableAddressLink={true} address={donation.donor.id} />
                    </td>
                    <td>{donation.comment || "[no comment]"}</td>
                    <td>{formatEther(donation.amount)} Ether</td>
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
