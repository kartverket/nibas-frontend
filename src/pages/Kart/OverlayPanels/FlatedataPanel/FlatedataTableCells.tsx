import { Tag, Checkbox, FormControl, FormErrorMessage, Select, SelectProps } from "@kvib/react";
import Input, { ValidationError } from "components/Input";
import { forwardRef } from "react";
import { styled } from "styled-components";
import { isValidUrl } from "./flatedata-utils";

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

export const URLInputCell = forwardRef<HTMLInputElement, InputCellProps>(function URLInputCell(
  { data, isEditing, ...inputProps }: InputCellProps,
  ref,
) {
  return (
    <TableCell>
      {isEditing ? (
        <Input type="url" defaultValue={data} {...inputProps} ref={ref} size="sm" />
      ) : (
        <Link href={data} target="_blank" rel="noopener noreferrer">
          {isValidUrl(data) ? new URL(data).hostname : data}
        </Link>
      )}
    </TableCell>
  );
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
  label: string;
  isEditing: boolean;
  isDisabled: boolean;
  validationError?: ValidationError;
};

export const MerknadCell = forwardRef<HTMLInputElement, MerknadCellProps>(function MerknadCell(
  { data, label, isEditing, validationError, isDisabled, ...inputProps }: MerknadCellProps,
  ref,
) {
  return (
    <TableCell>
      {isEditing ? (
        <FormControl isInvalid={validationError?.showError}>
          <Checkbox isDisabled={isDisabled} ref={ref} {...inputProps} defaultChecked={data}>
            {label}
          </Checkbox>
          <FormErrorMessage>{validationError?.message}</FormErrorMessage>
        </FormControl>
      ) : (
        data && (
          <Tag colorScheme="gray" size="md">
            {label}
          </Tag>
        )
      )}
    </TableCell>
  );
});

type SelectCellProps = {
  data: string;
  options: { label: string; value: string }[];
  isEditing: boolean;
} & SelectProps;

export const SelectCell = forwardRef<HTMLSelectElement, SelectCellProps>(function SelectCell(
  { data, isEditing, options, ...selectProps }: SelectCellProps,
  ref,
) {
  return (
    <TableCell>
      {isEditing ? (
        <Select defaultValue={data} ref={ref} size="sm" {...selectProps}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      ) : (
        <Tag colorScheme="gray" size="md">
          {data}
        </Tag>
      )}
    </TableCell>
  );
});

export default InputCell;
