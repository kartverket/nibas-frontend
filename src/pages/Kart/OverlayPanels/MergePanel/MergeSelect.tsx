import { forwardRef } from "react";
import { styled } from "styled-components";
import { StemmekretsResponse } from "types/api";
import { ValidationError } from "components/Input";
import { Button, Flex, FormControl, FormErrorMessage, FormLabel, Select, SelectProps } from "@kvib/react";

const MergeSelectWrapper = styled(FormControl)`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const MergeSelectErrorMessage = styled(FormErrorMessage)`
  width: 100%;
`;

const SelectLabel = styled(FormLabel)`
  width: 100%;
`;

type MergeSelectProps = {
  onRemove: () => unknown;
  showRemoveButton: boolean;
  stemmekretser: StemmekretsResponse[];
  validationError?: ValidationError;
} & SelectProps;

export const MergeSelect = forwardRef<HTMLSelectElement, MergeSelectProps>(
  ({ onRemove, stemmekretser, showRemoveButton, validationError, ...inputProps }, ref) => (
    <MergeSelectWrapper isInvalid={validationError?.showError}>
      <Flex justifyContent="space-between">
        <SelectLabel>Stemmekrets</SelectLabel>
        {showRemoveButton && (
          <Button size="sm" variant="tertiary" onClick={onRemove}>
            Fjern
          </Button>
        )}
      </Flex>
      <div>
        <Select {...inputProps} ref={ref} placeholder="Velg en stemmekrets fra listen">
          {stemmekretser.map((s) => (
            <option key={s.nummer} value={s.nummer}>
              {`${s.nummer} - ${s.navn}`}
            </option>
          ))}
        </Select>
      </div>

      <MergeSelectErrorMessage>{validationError?.message}</MergeSelectErrorMessage>
    </MergeSelectWrapper>
  ),
);

MergeSelect.displayName = "MergeSelect";
