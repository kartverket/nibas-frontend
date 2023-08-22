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

export const MergeMultiselect = ({
  alleStemmekretser,
}: MergeMultiselectProps) => {
  const {
    control,
    register,
    trigger,
    getValues,
    formState: { errors, isSubmitted },
  } = useFormContext<MergeFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "stemmekretsNummerTilSammenslaaing",
  });

  const triggerRevalidateOnChange = ({
    onChange,
    ...restProps
  }: SelectProps) => {
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
      const values = getValues("stemmekretsNummerTilSammenslaaing");
      if (value.trim() === "" || value === "default") {
        return "Du må velge en stemmekrets";
      }
      if (values.filter((v) => v.value === value).length > 1) {
        return "Du kan ikke velge samme krets flere ganger";
      }
      return true;
    },
  };

  return (
    <MultiSelectWrapper>
      {fields.map((field, index) => (
        <MergeSelect
          key={field.id}
          {...triggerRevalidateOnChange(
            register(
              `stemmekretsNummerTilSammenslaaing.${index}.value`,
              multiselectValidator
            )
          )}
          onRemove={() => remove(index)}
          stemmekretser={alleStemmekretser.filter(
            (s) => s.stemmekretsnummer !== getValues("stemmekrets")
          )}
          showRemoveButton={fields.length > 1}
          validationError={{
            showError: !!errors?.stemmekretsNummerTilSammenslaaing?.[index],
            message:
              errors?.stemmekretsNummerTilSammenslaaing?.[index]?.value
                ?.message ?? "",
          }}
        />
      ))}
      <LeggTilFlerButton
        variant="outline"
        rightIcon="add"
        onClick={() => append({ value: "default" })}
      >
        Legg til flere sammenslåinger
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
