"use client";

import { useState } from "react";
import { ZodFormattedError, z } from "zod";
import getErrorMessage from "~~/components/GetErrorMessage";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

interface CampaignUpdateFormProps {
  refetch: () => void;
  campaignId: number;
}

const updateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(10, {
      message: "The title must be at least 20 characters long",
    })
    .max(256, {
      message: "The title must be less than 256 characters long",
    }),
  content: z
    .string()
    .trim()
    .min(20, {
      message: "The content must be at least 20 characters long",
    })
    .max(65535, {
      message: "The content must be less than 65,535 characters long",
    }),
});

export const CampaignUpdateForm = ({ campaignId, refetch }: CampaignUpdateFormProps) => {
  const [titleInput, setTitleInput] = useState("");
  const [contentInput, setContentInput] = useState("");
  const [error, setError] = useState<ZodFormattedError<
    { title: string; claim: string; description: string },
    string
  > | null>(null);

  const { writeContractAsync, isPending } = useScaffoldWriteContract("SharedRealityExchange");

  // useScaffoldWatchContractEvent({
  //   contractName: "SharedRealityExchange",
  //   eventName: "CampaignUpdate",
  //   onLogs: logs => {
  //     console.log(logs);
  //     logs.map(log => {
  //       const { campaignId, author, title, content } = log.args as unknown as {
  //         campaignId: string;
  //         author: string;
  //         title: string;
  //         content: string;
  //       };
  //       if (userAccount.address === author && title == titleInput && title == titleInput && content == contentInput) {
  //         router.push(`/campaigns/${campaignId}`);
  //       }
  //     });
  //   },
  // });

  const handleSubmit = async () => {
    setError(null);

    const formState = {
      title: titleInput,
      content: contentInput,
    };

    const validatedFields = updateSchema.safeParse(formState);

    if (!validatedFields.success) {
      setError(validatedFields.error.format());
      return;
    }

    try {
      await writeContractAsync(
        {
          functionName: "createCampaignUpdate",
          args: [campaignId, titleInput, contentInput],
        },
        {
          onBlockConfirmation: txnReceipt => {
            console.log("📦 Transaction blockHash", txnReceipt);
            notification.success("Your campaign update has been created.", { position: "top-right", duration: 6000 });
            refetch();
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
          <h1 className="text-4xl text-center font-bold">Create campaign update</h1>
          <div className="flex items-center justify-center">
            <div className="flex flex-col w-4/5 gap-2 sm:gap-5">
              {error ? (
                <div className="flex justify-center">
                  <p className="whitespace-pre-line text-srered">There has been an error. See below.</p>
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
              {error && error.title && <div className="text-srered">{error.title._errors.join(" ")}</div>}{" "}
              <label className="text-lg font-bold">Content</label>
              <textarea
                placeholder="Content"
                className="px-3 py-3 border rounded-lg bg-base-200 border-base-300 textarea"
                value={contentInput}
                onChange={e => setContentInput(e.target.value)}
              />
              <div>Enter content for your update, at least 20 characters long.</div>
              {error && error.description && <div className="text-srered">{error.description._errors.join(" ")}</div>}
              <button className="w-10/12 my-8 mx-auto md:w-3/5 btn btn-primary" disabled={false}>
                {isPending ? <span className="loading loading-spinner loading-sm"></span> : <>Create Campaign Update</>}
              </button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};
