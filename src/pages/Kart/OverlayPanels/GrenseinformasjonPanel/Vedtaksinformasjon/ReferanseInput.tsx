import { Button, Divider, FormControl, Input } from "@kvib/react";
import { VedtakinfoRow } from "./VedtakinfoRow";
import { InputName, Referanse, VedtakinfoForm } from "./Vedtaksinformasjon";
import { styled } from "styled-components";
import { Control, Controller, FieldError, UseFormClearErrors, UseFormSetError } from "react-hook-form";
import { useState } from "react";

type ReferanseInputProps = {
  registerName: keyof InputName;
  placeholder: string;
  tooltipLabel: string;
  title: string;
  appendFn: (item: Referanse) => void;
  pattern?: RegExp;
  errors: FieldError | undefined;
  setError: UseFormSetError<VedtakinfoForm>;
  clearErrors: UseFormClearErrors<VedtakinfoForm>;
  control: Control<VedtakinfoForm>;
};

export const ReferanseInput = ({
  registerName,
  placeholder,
  tooltipLabel,
  title,
  appendFn,
  pattern,
  errors,
  setError,
  clearErrors,
  control,
}: ReferanseInputProps) => {
  const [appendButtonDisabled, setAppendButtonDisabled] = useState(true);
  function clearInput(element: HTMLInputElement) {
    element.value = "";
  }

  const appendReferanse = (element: HTMLInputElement) => {
    if (element?.value) {
      clearErrors();
      if (!inputIsValid(element.value, pattern)) {
        setError(registerName, { type: "manual", message: 'Lenker må starte med "http(s)://"' });
        return;
      }
      appendFn({ beskrivelse: element.value });
      clearInput(element);
      setAppendButtonDisabled(true);
    }
  };
  /**
   * Inputfeltet er et hjelpe-felt, og er registrert i formet hovedsaklig for å sette isDirty.
   * Feltet blir ikke med videre i historikken, verdiene til referanser legges til i egne lister.
   * FieldArray fra react-hook-form kunne nok vært benyttet.
   **/
  return (
    <InputContainer>
      <Divider />
      <Controller
        control={control}
        name={registerName}
        render={({ field }) => {
          return (
            <FormControl isInvalid={!!errors}>
              <VedtakinfoRow tooltipLabel={tooltipLabel} name={title} error={errors}>
                <Input
                  id={registerName}
                  placeholder={placeholder}
                  backgroundColor="white"
                  onChange={(e) => {
                    if (field.value === "") {
                      setAppendButtonDisabled(true);
                    } else {
                      setAppendButtonDisabled(false);
                    }
                    field.onChange(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const element = e.target as HTMLInputElement;
                      appendReferanse(element);
                      e.preventDefault();
                    }
                  }}
                />
                <LeggTilKnapp
                  isDisabled={appendButtonDisabled}
                  onClick={() => {
                    const element = document.getElementById(registerName) as HTMLInputElement;
                    appendReferanse(element);
                  }}
                >
                  Legg til
                </LeggTilKnapp>
              </VedtakinfoRow>
            </FormControl>
          );
        }}
      />
    </InputContainer>
  );
};

const InputContainer = styled.div`
  display: flex;
  gap: 8px;
  flex-direction: column;
`;
const inputIsValid = (input: string, pattern?: RegExp) => {
  if (!pattern) {
    return true;
  }
  return input.match(pattern) !== null;
};
const LeggTilKnapp = styled(Button)`
  margin-left: 20px;
`;
