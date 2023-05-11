import { StemmekretsResponse } from "../../../../types/api";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import Button from "../../../form/Button";
import Icon from "../../../Icon/Icon";
import { useFieldArray, useFormContext } from "react-hook-form";
import { MergeFormData } from "./MergeForm";
import { ChangeEvent, InputHTMLAttributes } from "react";
import { MergeSelect } from "./MergeSelect";

type MergeMultiselectProps = {
  alleStemmekretser: StemmekretsResponse[];
};

// TODO: må filtrere ut stemmekretsen som allerede er valgt
export const MergeMultiselect = ({
  alleStemmekretser,
}: MergeMultiselectProps) => {
  const { t } = useTranslation();
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
  }: InputHTMLAttributes<HTMLSelectElement>) => {
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
        return t("stemmekrets.validering.multiselect.obligatorisk");
      }
      if (values.filter((v) => v.value === value).length > 1) {
        return t("stemmekrets.validering.multiselect.unik");
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
          stemmekretser={alleStemmekretser}
          showRemoveButton={fields.length > 1}
          validationError={{
            showError: !!errors?.stemmekretsNummerTilSammenslaaing?.[index],
            message:
              errors?.stemmekretsNummerTilSammenslaaing?.[index]?.value
                ?.message ?? "",
          }}
        />
      ))}
      <LeggTilFlerButton onClick={() => append({ value: "default" })}>
        {t("stemmekrets.sammenslaaing.actions.legg-til-flere")}
      </LeggTilFlerButton>
    </MultiSelectWrapper>
  );
};

const MultiSelectWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const LeggTilFlerButton = styled(Button).attrs(() => ({
  icon: <Icon icon="add" />,
  variant: "secondary",
}))`
  margin-bottom: 8px;
  background: transparent;

  :hover {
    background: transparent;
  }
`;
