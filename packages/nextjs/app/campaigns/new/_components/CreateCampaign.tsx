"use client";

import { useState } from "react";

export const CreateCampaign = () => {
  const [titleInput, setTitleInput] = useState("");
  const [claimInput, setClaimInput] = useState("");
  const [descInput, setDescInput] = useState("");
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const variable = false;
  if (variable) {
    setErrorMsg("");
    setError(true);
  }

  return (
    <>
      <div className="px-6 pt-10 pb-8 shadow-xl sm:my-auto bg-secondary sm:mx-auto sm:max-w-11/12 md:w-9/12 sm:w-11/12 sm:rounded-lg sm:px-10">
        <div className="flex items-center justify-center">
          <div className="flex flex-col w-4/5 gap-2 sm:gap-5">
            {error ? (
              <div className="flex justify-center">
                <p className="whitespace-pre-line">{errorMsg}</p>
              </div>
            ) : (
              <></>
            )}
            {/* up-and-down */}
            <label className="text-lg font-bold">Title</label>
            <input
              type="text"
              placeholder="Title"
              className="px-3 py-3 border rounded-lg bg-base-200 border-base-300"
              value={titleInput}
              onChange={e => setTitleInput(e.target.value)}
            />{" "}
            <label className="text-lg font-bold">Claim</label>
            <input
              type="text"
              placeholder="Claim"
              className="px-3 py-3 border rounded-lg bg-base-200 border-base-300"
              value={claimInput}
              onChange={e => setClaimInput(e.target.value)}
            />{" "}
            <label className="text-lg font-bold">Description</label>
            <textarea
              placeholder="Description"
              className="px-3 py-3 border rounded-lg bg-base-200 border-base-300 textarea"
              value={descInput}
              onChange={e => setDescInput(e.target.value)}
            />
            <button className="w-10/12 mx-auto md:w-3/5 btn btn-primary" onClick={() => alert(42)} disabled={false}>
              {true ? <span className="loading loading-spinner loading-sm"></span> : <>Create Campaign</>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
