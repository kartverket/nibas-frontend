import { StemmekretsResponse } from "../../../../types/api";
import { styled } from "styled-components";
import { useFieldArray, useFormContext } from "react-hook-form";
import { MergeFormData } from "./MergeForm";
import { ChangeEvent } from "react";
import { MergeSelect } from "./MergeSelect";
import { Button, SelectProps } from "@kvib/react";

type MergeMultiselectProps = {
  alleStemmekretser: StemmekretsResponse[];
};

export const MergeMultiselect = ({ alleStemmekretser }: MergeMultiselectProps) => {
  const {
    control,
    register,
    trigger,
    getValues,
    formState: { errors, isSubmitted },
  } = useFormContext<MergeFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "nummerTilSammenslaaing",
  });

  const triggerRevalidateOnChange = ({ onChange, ...restProps }: SelectProps) => {
    return {
      onChange: (e: ChangeEvent<HTMLSelectElement>) => {
        if (onChange) {
          onChange(e);
        }
        if (isSubmitted) {
          trigger();
        }
      },
      ...restProps,
    };
  };

  const multiselectValidator = {
    validate: (value: string): string | boolean => {
      const values = getValues("nummerTilSammenslaaing");
      if (value.trim() === "" || value === "default") {
        return "Du må velge en stemmekrets";
      }
      if (values.filter((v) => v.value === value).length > 1) {
        return "Du kan ikke velge samme krets flere ganger";
      }
      if (values.some((v) => v.value === getValues("stemmekrets"))) {
        return "Du kan ikke slå en krets sammen med seg selv";
      }
      return true;
    },
  };

  return (
    <MultiSelectWrapper>
      {fields.map((field, index) => (
        <MergeSelect
          key={field.id}
          {...triggerRevalidateOnChange(register(`nummerTilSammenslaaing.${index}.value`, multiselectValidator))}
          onRemove={() => remove(index)}
          stemmekretser={alleStemmekretser}
          showRemoveButton={fields.length > 1}
          validationError={{
            showError: !!errors?.nummerTilSammenslaaing?.[index],
            message: errors?.nummerTilSammenslaaing?.[index]?.value?.message ?? "",
          }}
        />
      ))}
      <LeggTilFlerButton variant="tertiary" leftIcon="add" onClick={() => append({ value: "default" })}>
        Legg til flere stemmekretser
      </LeggTilFlerButton>
    </MultiSelectWrapper>
  );
};

const MultiSelectWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const LeggTilFlerButton = styled(Button)`
  margin-bottom: 8px;
`;
