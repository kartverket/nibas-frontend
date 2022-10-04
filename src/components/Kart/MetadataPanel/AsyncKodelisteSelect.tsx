import React, { forwardRef, SelectHTMLAttributes } from "react";
import { BlockLabel } from "./metadataComponents";
import Select from "components/form/Select";
import { KodelisteRespons } from "types/api";

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  kodeliste: KodelisteRespons | undefined;
  disabled?: boolean;
};

const AsyncKodelisteSelectInner = (
  { label, kodeliste, ...selectProps }: Props,
  ref: React.ForwardedRef<HTMLSelectElement>
) => {
  return (
    <BlockLabel>
      {label}
      <Select ref={ref} {...selectProps}>
        <option value="">---</option>
        {kodeliste?.items.map((kodeItem) => (
          <option key={kodeItem.id} value={kodeItem.id}>
            {kodeItem.label
              .replace(/([a-z])([A-Z])/g, "$1 $2")
              .replace(/([æøå])([ÆØÅ])/g, "$1 $2")
              .replace(/([a-z])([ÆØÅ])/g, "$1 $2")
              .replace(/([æøå])([A-Z])/g, "$1 $2")}
          </option>
        ))}
      </Select>
    </BlockLabel>
  );
};

const AsyncKodelisteSelect = forwardRef(AsyncKodelisteSelectInner);

AsyncKodelisteSelect.displayName = "AsyncKodelisteSelect";

export default AsyncKodelisteSelect;
