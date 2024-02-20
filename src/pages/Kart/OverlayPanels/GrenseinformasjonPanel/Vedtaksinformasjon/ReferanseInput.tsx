import { Button, Input } from "@kvib/react";
import { VedtakinfoRow } from "./VedtakinfoRow";
import { BorderTop, InputName, Referanse, VedtakinfoForm } from "./OversiktVedtaksinfo";
import { styled } from "styled-components";
import { FieldError, UseFormClearErrors, UseFormRegister, UseFormSetError } from "react-hook-form";

type ReferanseInputProps = {
  registerName: keyof InputName;
  placeholder: string;
  tooltipLabel: string;
  title: string;
  appendFn: (item: Referanse) => void;
  register: UseFormRegister<VedtakinfoForm>;
  pattern?: RegExp;
  errors: FieldError | undefined;
  setError: UseFormSetError<VedtakinfoForm>;
  clearErrors: UseFormClearErrors<VedtakinfoForm>;
};

export const ReferanseInput = ({
  registerName,
  placeholder,
  tooltipLabel,
  title,
  appendFn,
  register,
  pattern,
  errors,
  setError,
  clearErrors,
}: ReferanseInputProps) => {
  function clearInput(element: HTMLInputElement) {
    element.value = "";
  }

  const appendReferanse = (element: HTMLInputElement) => {
    if (element?.value) {
      clearErrors();
      if (!inputIsValid(element.value, pattern)) {
        setError(registerName, { type: "manual", message: 'Lenker må starte med "http(s)"' });
        return;
      }
      appendFn({ beskrivelse: element.value });
      clearInput(element);
    }
  };
  return (
    <BorderTop>
      <InputContainer>
        <VedtakinfoRow tooltipLabel={tooltipLabel} name={title} errors={errors}>
          <Input
            {...register(registerName, { pattern: pattern })}
            placeholder={placeholder}
            backgroundColor={"white"}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const element = e.target as HTMLInputElement;
                appendReferanse(element);
                e.preventDefault();
              }
            }}
          />
          <LeggTilKnapp
            onClick={() => {
              const element = document.querySelector(`input[name=${registerName}]`) as HTMLInputElement;
              appendReferanse(element);
            }}
          >
            Legg til
          </LeggTilKnapp>
        </VedtakinfoRow>
      </InputContainer>
    </BorderTop>
  );
};

const InputContainer = styled.div`
  padding-top: 10px;
`;
const inputIsValid = (input: string, pattern?: RegExp) => {
  if (!pattern) return true;
  return input.match(pattern) !== null;
};
const LeggTilKnapp = styled(Button)`
  margin-left: 20px;
`;
