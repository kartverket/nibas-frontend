import { useAuthentication } from "components/Authentication/AuthenticationHook";
import useToastUnique from "hooks/toast/useToastUnique";
import { FeatureCollection } from "types/api";
import { getUrlForPath, statusCode } from "utils/api";

export const useKartlagUpload = () => {
  const auth = useAuthentication();
  const { toastUnique: uploadErrorToast } = useToastUnique({
    status: "error",
    title: "Opplasting av kartlag feilet. ",
    description:
      "Husk at sosi-filene må være på versjon 4.5 eller nyere. Hvis feilen vedvarer, vennligst kontakt Kartverket",
  });

  const uploadKartlag = async (file: File): Promise<FeatureCollection | null> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(getUrlForPath("/v1/kartlag/upload"), {
      method: "POST",
      headers: {
        Authorization: "Bearer " + auth.token,
      },
      body: formData,
    });

    if (statusCode.isSuccessful(response.status)) {
      return await response.json();
    } else if (statusCode.isError(response.status)) {
      uploadErrorToast();
    }

    return null;
  };

  return uploadKartlag;
};
