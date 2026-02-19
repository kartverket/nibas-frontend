import {
  Tag,
  Checkbox,
  FormControl,
  FormErrorMessage,
  Select,
  SelectProps,
  Link,
  Wrap,
  WrapItem,
  Icon,
  Box,
} from "@kvib/react";
import Input, { ValidationError } from "components/Input";
import { forwardRef } from "react";
import ReactSelect, { MultiValue, OptionProps, components } from "react-select";
import { styled } from "styled-components";
import { MaterielleVilkaarValue, isValidUrl } from "./flatedata-utils";
import { MaterielleVilkaar } from "types/api";

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
          {options.find((o) => o.value === data)?.label ?? data}
        </Tag>
      )}
    </TableCell>
  );
});

export const MaterielleVilkaarOptions: { value: MaterielleVilkaarValue; label: string }[] = [
  { value: "BEBYGDEIENDOM", label: "Bebygd eiendom" },
  { value: "IKKEHELAARSBOLIGUNDEROPPFORING", label: "Ikke helårsbolig under oppføring" },
  { value: "UBEBYGDTOMT", label: "Ubebygd tomt" },
  { value: "UNNTAKFRASLEKTSKAPSUNNTAK", label: "Unntak fra slektskapsunntak" },
];

type SelectOption = { value: MaterielleVilkaarValue; label: string };

const OptionWithCheckmark = (props: OptionProps<SelectOption, true>) => {
  return (
    <components.Option {...props}>
      <OptionContent>
        <span>{props.label}</span>
        {props.isSelected && <Icon icon="check" />}
      </OptionContent>
    </components.Option>
  );
};

type MultiSelectCellProps = {
  data: MaterielleVilkaar;
  options: SelectOption[];
  isEditing: boolean;
  isDisabled: boolean;
  onChange: (values: MaterielleVilkaarValue[]) => void;
};

export const MultiSelectCell = ({ data, isEditing, options, isDisabled, onChange }: MultiSelectCellProps) => {
  const selectedOptions = options.filter((option) => data.includes(option.value) === true);

  const handleChange = (newValue: MultiValue<SelectOption>) => {
    onChange(newValue.map((option) => option.value));
  };

  const selectedCount = selectedOptions.length;
  const selectedLabels = selectedOptions.map((o) => o.label).join(", ");
  const placeholderText = selectedCount > 0 ? `${selectedLabels} valgt` : "Ingen valgt";
  const tooltipText = selectedCount > 0 ? placeholderText : undefined;

  return (
    <TableCell>
      {isEditing ? (
        <Box minWidth="200px">
          <ReactSelect<SelectOption, true>
            isMulti
            isClearable={false}
            value={selectedOptions}
            options={options}
            onChange={handleChange}
            isDisabled={isDisabled}
            placeholder={placeholderText}
            noOptionsMessage={() => "Ingen alternativer"}
            closeMenuOnSelect={false}
            hideSelectedOptions={false}
            controlShouldRenderValue={false}
            components={{
              Option: OptionWithCheckmark,
              ClearIndicator: () => null,
              IndicatorSeparator: () => null,
              Placeholder: (props) => (
                <components.Placeholder
                  {...props}
                  innerProps={{
                    ...props.innerProps,
                    title: tooltipText,
                  }}
                />
              ),
            }}
            styles={{
              control: (base) => ({
                ...base,
                minHeight: "32px",
                fontSize: "14px",
              }),
              valueContainer: (base) => ({
                ...base,
                padding: "0 8px",
              }),
              placeholder: (base) => ({
                ...base,
                color: selectedCount > 0 ? "#1A202C" : "A0AEC0",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "100%",
              }),
              indicatorsContainer: (base) => ({
                ...base,
                height: "30px",
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isSelected ? "#EFEFF1" : state.isFocused ? "#F7FAFC" : "white",
                color: "inherit",
                cursor: "pointer",
                ":active": {
                  backgroundColor: "#EDF2F7",
                },
              }),
            }}
          />
        </Box>
      ) : (
        <Wrap spacing={1}>
          {data.map((value) => {
            const option = options.find((o) => o.value === value);
            return option !== undefined ? (
              <WrapItem key={value}>
                <Tag colorScheme="gray" size="sm">
                  {option.label}
                </Tag>
              </WrapItem>
            ) : null;
          })}
        </Wrap>
      )}
    </TableCell>
  );
};

const OptionContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

export default InputCell;
