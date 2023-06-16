import { InputHTMLAttributes, forwardRef } from "react";
import styled from "styled-components";
import { StemmekretsResponse } from "types/api";
import Button from "components/form/Button";
import Select from "components/form/Select";
import { ValidationError } from "components/form/Input/Input";
import Message from "components/Status/Message";

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

const RemoveButton = styled(Button).attrs(() => ({ variant: "tertiary" }))`
  grid-area: fjern;
  margin-top: 26px;
  margin-left: 16px;
  background: transparent;

  :hover {
    background: transparent;
  }
`;

const MergeSelectStyle = styled(Select)`
  grid-area: select;
`;

type MergeSelectProps = {
  onRemove: () => unknown;
  showRemoveButton: boolean;
  stemmekretser: StemmekretsResponse[];
  validationError?: ValidationError;
} & InputHTMLAttributes<HTMLSelectElement>;

export const MergeSelect = forwardRef<HTMLDivElement, MergeSelectProps>(
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
    <MergeSelectWrapper ref={ref}>
      <MergeSelectStyle
        {...inputProps}
        defaultValue="default"
        label="Navn eller nummer på stemmekrets"
      >
        <option value={"default"} disabled>
          Velg en stemmekrets fra listen
        </option>
        {stemmekretser.map((s) => (
          <option key={s.stemmekretsnummer} value={s.stemmekretsnummer}>
            {`${s.stemmekretsnummer} - ${s.stemmekretsnavn}`}
          </option>
        ))}
      </MergeSelectStyle>
      {showRemoveButton && (
        <RemoveButton onClick={onRemove}>Fjern</RemoveButton>
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
