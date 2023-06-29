import { forwardRef } from "react";
import styled from "styled-components";
import { StemmekretsResponse } from "types/api";
import { ValidationError } from "components/Input";
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Select,
  SelectProps,
} from "@kvib/react";

const MergeSelectWrapper = styled(FormControl)`
  display: grid;
  align-items: center;
  grid-template-columns: 1fr auto;
  grid-template-areas:
    "select fjern"
    "error .";
  gap: 0 8px;
`;

const MergeSelectErrorMessage = styled(FormErrorMessage)`
  grid-area: error;
`;

const RemoveButton = styled(Button)`
  grid-area: fjern;
  margin-top: 32px;
`;

const SelectLabel = styled(FormLabel)`
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
    <MergeSelectWrapper isInvalid={validationError?.showError}>
      <div>
        <SelectLabel>Navn eller nummer på stemmekrets</SelectLabel>
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
      </div>
      {showRemoveButton && (
        <RemoveButton variant="ghost" onClick={onRemove}>
          Fjern
        </RemoveButton>
      )}
      <MergeSelectErrorMessage>
        {validationError?.message}
      </MergeSelectErrorMessage>
    </MergeSelectWrapper>
  )
);

MergeSelect.displayName = "MergeSelect";
