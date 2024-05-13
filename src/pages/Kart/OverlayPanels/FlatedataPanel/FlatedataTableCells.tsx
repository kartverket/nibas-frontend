import { Badge, Checkbox, FormControl, FormErrorMessage } from "@kvib/react";
import Input, { ValidationError } from "components/Input";
import { forwardRef } from "react";
import { styled } from "styled-components";

type InputProps = React.ComponentProps<typeof Input>;

type InputCellProps = {
  data: string;
  isEditing: boolean;
} & InputProps;

const InputCell = forwardRef<HTMLInputElement, InputCellProps>(function InputCell(
  { data, isEditing, ...inputProps }: InputCellProps,
  ref,
) {
  return <TableCell>{isEditing ? <Input defaultValue={data} {...inputProps} ref={ref} size="sm" /> : data}</TableCell>;
});

export const TableCell = ({ children }: { children: React.ReactNode }) => (
  <td>
    <CenteredText>{children}</CenteredText>
  </td>
);

const CenteredText = styled.span`
  vertical-align: middle;
`;

type MerknadCellProps = {
  data: boolean;
  isEditing: boolean;
  validationError?: ValidationError;
};

export const MerknadCell = forwardRef<HTMLInputElement, MerknadCellProps>(function MerknadCell(
  { data, isEditing, validationError, ...inputProps }: MerknadCellProps,
  ref,
) {
  return (
    <TableCell>
      {isEditing ? (
        <FormControl isInvalid={validationError?.showError}>
          <Checkbox ref={ref} {...inputProps} defaultChecked={data}>
            Samisk forvaltningsområde
          </Checkbox>
          <FormErrorMessage>{validationError?.message}</FormErrorMessage>
        </FormControl>
      ) : (
        data && <Merknad>Samisk forvaltningsområde</Merknad>
      )}
    </TableCell>
  );
});

const Merknad = styled(Badge)`
  display: inline-flex;
  align-items: center;
  height: 100%;
  padding: 0 8px;
  text-transform: unset;
  vertical-align: unset;
  border-radius: 6px;
  background: var(--kvib-colors-orange-100);
`;

export default InputCell;
