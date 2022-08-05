import { useEffect } from "react";
import {
  FieldPath,
  FieldValues,
  Path,
  PathValue,
  UnpackNestedValue,
  UseFormSetValue,
} from "react-hook-form";
import useNibasApi from "hooks/useNibasApi";
import { KodelistePath } from "types/api";

type Params<T extends FieldValues> = {
  property: FieldPath<T>;
  setValue: UseFormSetValue<T>;
  kodelisteUrl: KodelistePath;
  itemId: string | undefined;
};

const useAsyncKodeliste = <T extends FieldValues>(params: Params<T>) => {
  const { kodelisteUrl, setValue, itemId, property } = params;

  const { data: kodeliste } = useNibasApi(kodelisteUrl);

  // oppdater målemetode tekstfelt når kodene er hentet
  useEffect(() => {
    if (!kodeliste) return;

    const selectedKodelisteItem = kodeliste.items.find(
      (kode) => kode.id === itemId
    );

    if (!selectedKodelisteItem) return;

    setValue(
      property,
      selectedKodelisteItem.id as UnpackNestedValue<PathValue<T, Path<T>>>
    );
  }, [kodeliste, setValue, itemId, property]);

  return kodeliste;
};

export default useAsyncKodeliste;
