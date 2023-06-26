import { Select, SelectProps } from "@kvib/react";
import Label from "components/Label";
import React, { forwardRef } from "react";
import { KodelisteRespons } from "types/api";

type Props = SelectProps & {
  label: string;
  kodeliste: KodelisteRespons | undefined;
  disabled?: boolean;
};

const AsyncKodelisteSelectInner = (
  { label, kodeliste, ...selectProps }: Props,
  ref: React.ForwardedRef<HTMLSelectElement>
) => {
  return (
    <Label label={label}>
      <Select ref={ref} {...selectProps}>
        <option value="">---</option>
        {kodeliste?.items.map((kodeItem) => (
          <option key={kodeItem.id} value={kodeItem.id}>
            {kodeItem.label.replace(/([a-zæøå])([A-ZÆØÅ])/g, "$1 $2")}
          </option>
        ))}
      </Select>
    </Label>
  );
};

const AsyncKodelisteSelect = forwardRef(AsyncKodelisteSelectInner);

AsyncKodelisteSelect.displayName = "AsyncKodelisteSelect";

export default AsyncKodelisteSelect;
