import { Button, Input } from "@kvib/react";
import { Feature } from "ol";
import { VedtakinfoRow } from "./VedtakinfoRow";
import { useDokumentreferanser } from "./useDokumentreferanser";
import {
  InputName,
  InputCollection,
  Referanse,
  VedtakinfoForm,
} from "./OversiktReferanser";
import { styled } from "styled-components";
import { UseFormRegister } from "react-hook-form";
import { useEffect } from "react";

export const ReferanseInput = ({
  inputName,
  inputCollectionName,
  placeholder,
  tooltipLabel,
  title,
  appendFn,
  register,
}: {
  inputName: keyof InputName;
  inputCollectionName: keyof InputCollection;
  placeholder: string;
  tooltipLabel: string;
  title: string;
  appendFn: (item: Referanse) => void;
  register: UseFormRegister<VedtakinfoForm>;
}) => {
  function clearInput(element: HTMLInputElement) {
    element.value = "";
  }

  return (
    <VedtakinfoRow tooltipLabel={tooltipLabel} name={title}>
      <Input hidden {...register(inputCollectionName)} />
      <Input
        {...register(inputName)}
        placeholder={placeholder}
        backgroundColor={"white"}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            const element = e.target as HTMLInputElement;
            if (element?.value) {
              appendFn({ beskrivelse: element.value });
              clearInput(element);
            }
          }
        }}
      />
      <LeggTilKnapp
        onClick={() => {
          const element = document.querySelector(
            `input[name=${inputName}]`,
          ) as HTMLInputElement;
          if (element?.value) {
            appendFn({ beskrivelse: element.value });
            clearInput(element);
          }
        }}
      >
        Legg til
      </LeggTilKnapp>
    </VedtakinfoRow>
  );
};

const LeggTilKnapp = styled(Button)`
  margin-left: 20px;
`;
