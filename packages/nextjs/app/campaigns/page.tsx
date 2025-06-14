import React from "react";
import { CampaignsList } from "./_components/CampaignsList";
// import router from "next/navigation";
import MetaHeader from "~~/components/MetaHeader";

export default function BrowseCampaigns(): React.ReactNode {
  return (
    <>
      <MetaHeader title="Browse Campaigns" />
      <div className="flex flex-col w-full p-4 mx-auto shadow-xl sm:my-auto bg-secondary sm:p-7 sm:rounded-lg sm:w-4/5 lg:w-2/5">
        {/* <div className="flex justify-start mb-5">
          <button className="btn btn-sm btn-primary" onClick={() => router.back()}>
            Back
          </button>
        </div> */}
        <h1 className="font-bold text-primary-content">Campaigns</h1>
        <CampaignsList />
      </div>
    </>
  );
}
