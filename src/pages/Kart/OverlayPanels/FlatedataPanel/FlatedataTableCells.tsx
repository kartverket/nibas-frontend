import { Tag, Checkbox, FormControl, FormErrorMessage } from "@kvib/react";
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
  isDisabled: boolean;
  validationError?: ValidationError;
};

export const MerknadCell = forwardRef<HTMLInputElement, MerknadCellProps>(function MerknadCell(
  { data, isEditing, validationError, isDisabled, ...inputProps }: MerknadCellProps,
  ref,
) {
  return (
    <TableCell>
      {isEditing ? (
        <FormControl isInvalid={validationError?.showError}>
          <Checkbox isDisabled={isDisabled} ref={ref} {...inputProps} defaultChecked={data}>
            Samisk forvaltningsområde
          </Checkbox>
          <FormErrorMessage>{validationError?.message}</FormErrorMessage>
        </FormControl>
      ) : (
        data && (
          <Tag colorScheme="gray" size="md">
            Samisk forvaltningsområde
          </Tag>
        )
      )}
    </TableCell>
  );
});

export default InputCell;
