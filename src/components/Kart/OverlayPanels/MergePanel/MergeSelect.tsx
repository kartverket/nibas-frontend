import { forwardRef } from "react";
import styled from "styled-components";
import { StemmekretsResponse } from "types/api";
import { ValidationError } from "components/form/Input/Input";
import Message from "components/Status/Message";
import { Button, Select, SelectProps } from "@kvib/react";
import Label from "components/Label";

const MergeSelectWrapper = styled.div`
  display: grid;
  align-items: center;
  grid-template-columns: 1fr auto;
  grid-template-areas:
    "select fjern"
    "error .";
  gap: 8px;
`;

const MergeSelectErrorMessage = styled(Message)`
  grid-area: error;
`;

const RemoveButton = styled(Button)`
  grid-area: fjern;
  margin-top: 32px;
`;

const SelectLabel = styled(Label)`
  grid-area: select;
`;

type MergeSelectProps = {
  onRemove: () => unknown;
  showRemoveButton: boolean;
  stemmekretser: StemmekretsResponse[];
  validationError?: ValidationError;
} & SelectProps;

export const MergeSelect = forwardRef<HTMLSelectElement, MergeSelectProps>(
  (
    {
      onRemove,
      stemmekretser,
      showRemoveButton,
      validationError,
      ...inputProps
    },
    ref
  ) => (
    <MergeSelectWrapper>
      <SelectLabel label="Navn eller nummer på stemmekrets">
        <Select
          {...inputProps}
          ref={ref}
          placeholder="Velg en stemmekrets fra listen"
        >
          {stemmekretser.map((s) => (
            <option key={s.stemmekretsnummer} value={s.stemmekretsnummer}>
              {`${s.stemmekretsnummer} - ${s.stemmekretsnavn}`}
            </option>
          ))}
        </Select>
      </SelectLabel>
      {showRemoveButton && (
        <RemoveButton variant="ghost" onClick={onRemove}>
          Fjern
        </RemoveButton>
      )}
      {validationError?.showError && (
        <MergeSelectErrorMessage status="error">
          {validationError.message}
        </MergeSelectErrorMessage>
      )}
    </MergeSelectWrapper>
  )
);

MergeSelect.displayName = "MergeSelect";
