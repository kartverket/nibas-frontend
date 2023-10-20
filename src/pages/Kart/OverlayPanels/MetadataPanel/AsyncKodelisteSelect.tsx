import { Select, SelectProps } from "@kvib/react";
import React, { forwardRef, useEffect } from "react";
import { UseFormGetValues, UseFormSetValue } from "react-hook-form";
import { MetadataField } from "../hooks/useMetadataField";
import useNibasApi from "hooks/useNibasApi";

type Props = SelectProps & {
  setValue?: UseFormSetValue<MetadataField>;
  getValues?: UseFormGetValues<MetadataField>;
};

const AsyncKodelisteSelectInner = (
  { setValue, getValues, ...selectProps }: Props,
  ref: React.ForwardedRef<HTMLSelectElement>,
) => {
  const { data: kodeliste } = useNibasApi("/v1/kodeliste/maalemetode-koder");

  // oppdater målemetode tekstfelt når kodene er hentet
  useEffect(() => {
    if (!kodeliste || !getValues || !setValue) return;

    const selectedKodelisteItem = kodeliste.items.find(
      (kode) => kode.id === getValues().metadata,
    );

    if (!selectedKodelisteItem) return;

    setValue("metadata", selectedKodelisteItem.id);
  }, [kodeliste, setValue, getValues]);

  return (
    <Select ref={ref} {...selectProps}>
      <option value="">---</option>
      {kodeliste &&
        kodeliste.items.map((kodeItem) => (
          <option key={kodeItem.id} value={kodeItem.id}>
            {kodeItem.label.replace(/([a-zæøå])([A-ZÆØÅ])/g, "$1 $2")}
          </option>
        ))}
    </Select>
  );
};

const AsyncKodelisteSelect = forwardRef(AsyncKodelisteSelectInner);

AsyncKodelisteSelect.displayName = "AsyncKodelisteSelect";

export default AsyncKodelisteSelect;
