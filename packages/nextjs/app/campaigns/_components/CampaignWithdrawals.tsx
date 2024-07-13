"use client";

import { Dispatch, SetStateAction } from "react";
import { formatEther } from "viem";
import { Address } from "~~/components/scaffold-eth";

type CampaignsWithdrawalsListProps = {
  loading: boolean;
  withdrawals: Withdrawal[];
  pageSize: number;
  setPageSize: Dispatch<SetStateAction<number>>;
  pageNum: number;
  setPageNum: Dispatch<SetStateAction<number>>;
};

type Withdrawal = {
  id: string;
  withdrawer: {
    id: string;
  };
  amount: bigint;
  comment: string;
  createdAt: number;
};

export const CampaignsWithdrawalsList = ({
  loading,
  withdrawals,
  pageSize,
  setPageSize,
  pageNum,
  setPageNum,
}: CampaignsWithdrawalsListProps) => {
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
                <th>Withdrawer</th>
                <th>Comment</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals?.map((withdrawal: Withdrawal) => {
                // console.log("withdrawal", withdrawal)
                return (
                  <tr key={withdrawal.id} className="hover">
                    <td>{new Date(withdrawal.createdAt * 1000).toLocaleString()}</td>
                    <td>
                      <Address disableAddressLink={true} address={withdrawal.withdrawer.id} />
                    </td>
                    <td>{withdrawal.comment || "[no comment]"}</td>
                    <td>{formatEther(withdrawal.amount)} Ether</td>
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
