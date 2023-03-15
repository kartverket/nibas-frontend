import React, { forwardRef, SelectHTMLAttributes } from "react";
import Select from "components/form/Select";
import { KodelisteRespons } from "types/api";
import Label from "components/form/Label";

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
