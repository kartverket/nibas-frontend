import { useAuthentication } from "components/Authentication/AuthenticationHook";
import useToastUnique from "hooks/toast/useToastUnique";
import useSWRMutation from "swr/mutation";
import { FeatureCollection } from "types/api";
import { getUrlForPath, statusCode } from "utils/api";

export const useKartlagUpload = () => {
  const auth = useAuthentication();
  const { toastUnique: uploadErrorToast } = useToastUnique({
    status: "error",
    title: "Opplasting av kartlag feilet. ",
    description:
      "Husk at sosi-filene må være på versjon 4.5 eller nyere, og at filstørrelsen ikke kan overstige 1MB. Hvis feilen vedvarer, vennligst kontakt Kartverket",
  });
  const uploadFetcher = async (url: string, { arg }: { arg: { file: File; token: string } }) => {
    const sizeInMB = arg.file.size / 1024 ** 2;
    if (sizeInMB > 1) {
      throw new Error("Filen er for stor");
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
      throw new Error(`Opplasting feilet med status ${response.status}`);
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
    onError: () => {
      uploadErrorToast();
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
