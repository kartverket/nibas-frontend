import { Button, Input } from "@kvib/react";
import { VedtakinfoRow } from "./VedtakinfoRow";
import {
  BorderTop,
  InputCollectionName,
  InputName,
  Referanse,
  VedtakinfoForm,
} from "./OversiktReferanser";
import { styled } from "styled-components";
import {
  FieldError,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { useEffect } from "react";
import { Dokref } from "types/api";

export const ReferanseInput = ({
  defaultValues,
  registerName,
  placeholder,
  tooltipLabel,
  title,
  appendFn,
  register,
  pattern,
  errors,
}: {
  defaultValues?: Referanse[];
  registerName: keyof InputName;
  placeholder: string;
  tooltipLabel: string;
  title: string;
  appendFn: (item: Referanse) => void;
  register: UseFormRegister<VedtakinfoForm>;
  pattern?: RegExp;
  errors: FieldError | undefined;
}) => {
  function clearInput(element: HTMLInputElement) {
    element.value = "";
  }

  const appendReferanse = (element: HTMLInputElement) => {
    if (element?.value) {
      appendFn({ beskrivelse: element.value });
      clearInput(element);
    }
  };
  return (
    <BorderTop>
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
            const element = document.querySelector(
              `input[name=${registerName}]`,
            ) as HTMLInputElement;
            appendReferanse(element);
          }}
        >
          Legg til
        </LeggTilKnapp>
      </VedtakinfoRow>
    </BorderTop>
  );
};

const LeggTilKnapp = styled(Button)`
  margin-left: 20px;
`;
