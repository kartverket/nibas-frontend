import { useToast } from "@kvib/react";
import { useAuthentication } from "components/Authentication/useAuthentication";
import useSWRMutation from "swr/mutation";
import { FeatureCollection } from "types/api";
import { getUrlForPath, statusCode } from "utils/api";

export const useKartlagUpload = () => {
  const auth = useAuthentication();
  const toast = useToast();
  const uploadFetcher = async (url: string, { arg }: { arg: { file: File; token: string } }) => {
    const sizeInMB = arg.file.size / 1024 ** 2;
    if (sizeInMB > 50) {
      throw new Error("Filstørrelsen kan ikke overstige 50MB per fil");
    }

    const formData = new FormData();
    formData.append("file", arg.file);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + arg.token,
      },
      body: formData,
    });

    if (!statusCode.isSuccessful(response.status)) {
      const body = await response.json();
      throw new Error(
        "errorDescription" in body && "description" in body.errorDescription
          ? body.errorDescription.description
          : "Ukjent feil ved opplasting av kartlag",
      );
    }

    return await response.json();
  };

  const {
    trigger: uploadKartlag,
    isMutating: isLoading,
    error,
    data,
    reset,
  } = useSWRMutation(getUrlForPath("/v1/kartlag/upload"), uploadFetcher, {
    onError: (e) => {
      toast({
        status: "error",
        title: "Opplasting av kartlag feilet. ",
        description: e.message,
      });
    },
  });

  const handleUpload = async (file: File): Promise<FeatureCollection | null> => {
    try {
      const result = await uploadKartlag({ file, token: auth.token ?? "" });
      return result;
    } catch {
      return null;
    }
  };

  return {
    uploadKartlag: handleUpload,
    isLoading,
    error,
    data,
    reset,
  };
};
