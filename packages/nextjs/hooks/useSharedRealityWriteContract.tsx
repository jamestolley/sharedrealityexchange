"use client";

import { WriteContractErrorType, WriteContractReturnType } from "@wagmi/core";
import { useWriteContract } from "wagmi";
import getErrorMessage from "~~/components/GetErrorMessage";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { notification } from "~~/utils/scaffold-eth";
import { ContractName, contracts } from "~~/utils/scaffold-eth/contract";

type useSharedRealityWriteContractProps = {
  functionName:
    | "createCampaign"
    | "createCampaignUpdate"
    | "createIdea"
    | "deleteIdea"
    | "donateToCampaign"
    | "follow"
    | "renounceOwnership"
    | "transferOwnership"
    | "unfollow"
    | "updateCampaignClaim"
    | "updateCampaignDescription"
    | "updateCampaignTitle"
    | "updateIdeaParent"
    | "updateIdeaPosition"
    | "updateIdeaText"
    | "updateIdeaType"
    | "withdrawFromCampaign";
  args: any;
  successMessage?: string;
  errorMessageFormat?: string; // "Failed to update idea text: {}", for example; the {} will be replaced with the actual error message
  callback?: (
    success: boolean,
    dataOrError: WriteContractReturnType | WriteContractErrorType | unknown,
    variables?: any,
    context?: any,
  ) => void;
};

const successMessages = {
  createCampaign: "Campaign created",
  createCampaignUpdate: "Campaign update created",
  createIdea: "Idea created",
  deleteIdea: "Idea deleted",
  donateToCampaign: "Donation submitted",
  follow: "Campaign followed",
  renounceOwnership: "Ownership renounced",
  transferOwnership: "Ownership transferred",
  unfollow: "Campaign unfollowed",
  updateCampaignClaim: "Campaign claim updated",
  updateCampaignDescription: "Campaign description updated",
  updateCampaignTitle: "Campaign title updated",
  updateIdeaParent: "Idea parent updated",
  updateIdeaPosition: "Idea position updated",
  updateIdeaText: "Idea text updated",
  updateIdeaType: "Idea type updated",
  withdrawFromCampaign: "Withdrawal submitted",
};

export const useSharedRealityWriteContract = () => {
  const { writeContractAsync } = useWriteContract();

  const contractName = "SharedRealityExchange";
  const { targetNetwork } = useTargetNetwork();
  const deployedContract = contracts?.[targetNetwork.id]?.[contractName as ContractName];
  const abi = deployedContract?.abi;

  const writeSharedRealityContractAsync = async ({
    functionName,
    args,
    successMessage = "",
    errorMessageFormat = "{}",
    callback,
  }: useSharedRealityWriteContractProps) => {
    if (successMessage == "") {
      successMessage = successMessages[functionName];
    }

    if (abi) {
      try {
        console.log(`Calling SharedRealityExchange.${functionName} with args: `, args);
        await writeContractAsync(
          {
            abi: abi,
            address: deployedContract.address,
            functionName: functionName,
            args: args,
          },
          {
            onSuccess: (data, variables, context) => {
              console.log("Success", data, variables, context);
              notification.success(successMessage, { position: "top-right", duration: 6000 });
              if (typeof callback == "function") {
                callback(true, data, variables, context);
              }
            },
            onError: (error, variables, context) => {
              const errorMessage = getErrorMessage(error);
              console.log("Error", error, variables, context);
              notification.error(errorMessageFormat.replace("{}", errorMessage), {
                position: "top-right",
                duration: 6000,
              });
              if (typeof callback == "function") {
                callback(false, error, variables, context);
              }
            },
          },
        );
      } catch (error: unknown) {
        console.error(error);
        const message = getErrorMessage(error);
        notification.error(errorMessageFormat.replace("{}", message), { position: "top-right", duration: 6000 });
        if (typeof callback == "function") {
          callback(false, error);
        }
      }
    }
  };

  return { writeSharedRealityContractAsync: writeSharedRealityContractAsync };
};
