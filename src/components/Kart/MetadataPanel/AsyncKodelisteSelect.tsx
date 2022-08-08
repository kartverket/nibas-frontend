import React, { forwardRef } from "react";
import { BlockLabel } from "./metadataComponents";
import Select from "components/form/Select";
import { KodelisteRespons } from "types/api";

type Props = {
  label: string;
  kodeliste: KodelisteRespons | undefined;
};

const AsyncKodelisteSelect = (
  { label, kodeliste }: Props,
  ref: React.ForwardedRef<HTMLSelectElement>
) => {
  return (
    <BlockLabel>
      {label}
      <Select ref={ref}>
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

AsyncKodelisteSelect.displayName = "AsyncKodelisteSelect";

export default forwardRef(AsyncKodelisteSelect);
