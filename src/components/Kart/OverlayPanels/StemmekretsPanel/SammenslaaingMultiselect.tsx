import { StemmekretsRef } from "../../../../types/api";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import Button from "../../../form/Button";
import Select from "../../../form/Select";
import Icon from "../../../Icon/Icon";
import { useFieldArray, useFormContext } from "react-hook-form";
import { SammenslaaingFormData } from "./SammanslaaingForm";
import { ChangeEvent, forwardRef, InputHTMLAttributes } from "react";
import { ErrorMessage, ValidationError } from "../../../form/Input/Input";

type SammenslaaingMultiselectProps = {
  stemmekretsnavn: string;
  alleStemmekretser: StemmekretsRef[];
};

export const SammenslaaingMultiselect = ({
  stemmekretsnavn,
  alleStemmekretser,
}: SammenslaaingMultiselectProps) => {
  const { t } = useTranslation();
  const {
    control,
    register,
    trigger,
    getValues,
    formState: { errors, isSubmitted },
  } = useFormContext<SammenslaaingFormData>();
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
    <section>
      <p>
        {t("stemmekrets.sammenslaaing.undertittel")}{" "}
        <Stemmekretsnavn>{stemmekretsnavn}</Stemmekretsnavn>?
      </p>
      <MultiSelectWrapper>
        {fields.map((field, index) => {
          return (
            <StemmekretsSelect
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
          );
        })}
        <LeggTilFlerButton onClick={() => append({ value: "default" })}>
          {t("stemmekrets.sammenslaaing.actions.legg-til-flere")}
        </LeggTilFlerButton>
      </MultiSelectWrapper>
    </section>
  );
};

type StemmekretsSelectProps = {
  onRemove: () => unknown;
  showRemoveButton: boolean;
  stemmekretser: StemmekretsRef[];
  validationError?: ValidationError;
} & InputHTMLAttributes<HTMLSelectElement>;

export const StemmekretsSelect = forwardRef<
  HTMLDivElement,
  StemmekretsSelectProps
>(
  (
    {
      onRemove,
      stemmekretser,
      showRemoveButton,
      validationError,
      ...inputProps
    },
    ref
  ) => {
    const { t } = useTranslation();
    return (
      <StemmekretsSelectWrapper ref={ref}>
        <StemmekretsSelectStyle
          {...inputProps}
          defaultValue="default"
          label={t("stemmekrets.sammenslaaing.label")}
        >
          <option value={"default"} disabled>
            {t("stemmekrets.sammenslaaing.actions.velg")}
          </option>
          {stemmekretser.map((s) => (
            <option key={s.nummer} value={s.nummer}>
              {`${s.nummer} - ${s.navn}`}
            </option>
          ))}
        </StemmekretsSelectStyle>
        {showRemoveButton && (
          <RemoveButton onClick={onRemove}>Fjern</RemoveButton>
        )}
        {validationError?.showError && (
          <StemmekretsErrorMessage>
            <Icon icon="warning_amber" />
            {validationError.message}
          </StemmekretsErrorMessage>
        )}
      </StemmekretsSelectWrapper>
    );
  }
);

StemmekretsSelect.displayName = "StemmekretsSelect";

const StemmekretsSelectWrapper = styled.div`
  display: grid;
  align-items: center;
  gap: 10px;

  grid-template-columns: 450px auto;
  grid-template-areas:
    "select fjern"
    "error .";
`;

const StemmekretsErrorMessage = styled(ErrorMessage)`
  grid-area: error;
`;

const Stemmekretsnavn = styled.span`
  font-weight: 900;
`;

const RemoveButton = styled(Button).attrs(() => ({ variant: "tertiary" }))`
  grid-area: fjern;
  margin-top: 26px;
  background: transparent;

  :hover {
    background: transparent;
  }
`;

const MultiSelectWrapper = styled.div`
  margin-top: 40px;
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

const StemmekretsSelectStyle = styled(Select)`
  grid-area: select;
`;
