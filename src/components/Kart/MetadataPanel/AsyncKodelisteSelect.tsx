import React, { forwardRef } from "react";
import { BlockLabel } from "./metadataComponents";
import Select from "components/form/Select";
import { KodelisteRespons } from "types/api";

type Props = {
  label: string;
  kodeliste: KodelisteRespons | undefined;
  disabled?: boolean;
};

const AsyncKodelisteSelectInner = (
  { label, kodeliste, disabled }: Props,
  ref: React.ForwardedRef<HTMLSelectElement>
) => {
  return (
    <BlockLabel>
      {label}
      <Select ref={ref} disabled={disabled}>
        <option value="">---</option>
        {kodeliste?.items.map((kodeItem) => (
          <option key={kodeItem.id} value={kodeItem.id}>
            {kodeItem.label}
          </option>
        ))}
      </Select>
    </BlockLabel>
  );
};

const AsyncKodelisteSelect = forwardRef(AsyncKodelisteSelectInner);

AsyncKodelisteSelect.displayName = "AsyncKodelisteSelect";

export default AsyncKodelisteSelect;
