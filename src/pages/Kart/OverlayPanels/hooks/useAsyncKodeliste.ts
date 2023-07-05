import { useEffect } from "react";
import {
  FieldPath,
  FieldValues,
  Path,
  PathValue,
  UseFormSetValue,
} from "react-hook-form";
import useNibasApi from "hooks/useNibasApi";
import { KodelistePath } from "types/api";

type Params<T extends FieldValues> = {
  property: FieldPath<T>;
  setValue: UseFormSetValue<T>;
  kodelisteUrl: KodelistePath;
  initialItemId: string | undefined;
};

const useAsyncKodeliste = <T extends FieldValues>(params: Params<T>) => {
  const { kodelisteUrl, setValue, initialItemId, property } = params;

  const { data: kodeliste } = useNibasApi(kodelisteUrl);

  // oppdater målemetode tekstfelt når kodene er hentet
  useEffect(() => {
    if (!kodeliste) return;

    const selectedKodelisteItem = kodeliste.items.find(
      (kode) => kode.id === initialItemId
    );

    if (!selectedKodelisteItem) return;

    setValue(property, selectedKodelisteItem.id as PathValue<T, Path<T>>);
  }, [kodeliste, setValue, initialItemId, property]);

  return kodeliste;
};

export default useAsyncKodeliste;
