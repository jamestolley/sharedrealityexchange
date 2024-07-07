"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
// import { notification } from "~~/utils/scaffold-eth";
import { ZodFormattedError, z } from "zod";
import getErrorMessage from "~~/components/GetErrorMessage";
import { useScaffoldWatchContractEvent, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

const campaignSchema = z.object({
  title: z
    .string()
    .trim()
    .min(20, {
      message: "The title must be at least 20 characters long",
    })
    .max(256, {
      message: "The title must be less than 256 characters long",
    }),
  claim: z
    .string()
    .trim()
    .min(10, {
      message: "The title must be at least 10 characters long",
    })
    .max(256, {
      message: "The claim must be less than 256 characters long",
    }),
  description: z
    .string()
    .trim()
    .min(20, {
      message: "The description must be at least 20 characters long",
    })
    .max(65535, {
      message: "The description must be less than 65,535 characters long",
    }),
});

export const CreateCampaign = () => {
  const router = useRouter();
  const userAccount = useAccount();
  const [titleInput, setTitleInput] = useState("");
  const [claimInput, setClaimInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [error, setError] = useState<ZodFormattedError<
    { title: string; claim: string; description: string },
    string
  > | null>(null);

  const { writeContractAsync, isPending } = useScaffoldWriteContract("SharedRealityExchange");

  useScaffoldWatchContractEvent({
    contractName: "SharedRealityExchange",
    eventName: "CampaignCreated",
    onLogs: logs => {
      console.log(logs);
      logs.map(log => {
        const { campaignId, owner, title, claim } = log.args as unknown as {
          campaignId: string;
          owner: string;
          title: string;
          claim: string;
          description: string;
        };
        if (userAccount.address === owner && title == titleInput && claim == claimInput) {
          router.push(`/campaigns/${campaignId}`);
        }
      });
    },
  });

  const handleSubmit = async () => {
    setError(null);

    const formState = {
      title: titleInput,
      claim: claimInput,
      description: descriptionInput,
    };

    // console.log(`formState: `, formState)

    const validatedFields = campaignSchema.safeParse(formState);

    if (!validatedFields.success) {
      setError(validatedFields.error.format());
      return;
    }

    try {
      await writeContractAsync(
        {
          functionName: "createCampaign",
          args: [titleInput, claimInput, descriptionInput],
        },
        {
          onBlockConfirmation: txnReceipt => {
            console.log("📦 Transaction blockHash", txnReceipt);
          },
        },
      );
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      notification.error(message, { position: "top-right", duration: 6000 });
    }
  };

  return (
    <>
      <form action={handleSubmit} className="mt-16">
        <div className="mt-8 px-6 pt-10 pb-8 shadow-xl sm:my-auto bg-secondary sm:mx-auto sm:max-w-11/12 md:w-9/12 sm:w-11/12 sm:rounded-lg sm:px-10">
          <h1 className="text-4xl text-center font-bold">Create crowdfunding campaign</h1>
          <div className="flex items-center justify-center">
            <div className="flex flex-col w-4/5 gap-2 sm:gap-5">
              {error ? (
                <div className="flex justify-center">
                  <p className="whitespace-pre-line text-srered">{error && "There has been an error. See below."}</p>
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
              />
              <div>Enter a title for your campaign, between 20 and 256 characters long.</div>
              {error && <div className="text-srered">{error?.title?._errors.join(" ")}</div>}{" "}
              <label className="text-lg font-bold">Claim</label>
              <input
                type="text"
                placeholder="Claim"
                className="px-3 py-3 border rounded-lg bg-base-200 border-base-300"
                value={claimInput}
                onChange={e => setClaimInput(e.target.value)}
              />
              <div>Enter a claim for your campaign, between 10 and 256 characters long.</div>
              {error && <div className="text-srered">{error?.claim?._errors.join(" ")}</div>}{" "}
              <label className="text-lg font-bold">Description</label>
              <textarea
                placeholder="Description"
                className="px-3 py-3 border rounded-lg bg-base-200 border-base-300 textarea"
                value={descriptionInput}
                onChange={e => setDescriptionInput(e.target.value)}
              />
              <div>Enter a description for your campaign, at least 20 characters long.</div>
              {error && <div className="text-srered">{error?.description?._errors.join(" ")}</div>}
              <button className="w-10/12 my-8 mx-auto md:w-3/5 btn btn-primary" disabled={false}>
                {isPending ? <span className="loading loading-spinner loading-sm"></span> : <>Create Campaign</>}
              </button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};
