import { Button, Input } from "@kvib/react";
import { VedtakinfoRow } from "./VedtakinfoRow";
import {
  InputCollectionName,
  InputName,
  Referanse,
  VedtakinfoForm,
} from "./OversiktReferanser";
import { styled } from "styled-components";
import {
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { useEffect } from "react";
import { Dokref } from "types/api";

export const ReferanseInput = ({
  defaultValues,
  collectionRegisterName,
  registerName,
  placeholder,
  tooltipLabel,
  title,
  appendFn,
  register,
  watch,
}: {
  defaultValues?: Referanse[];
  registerName: keyof InputName;
  collectionRegisterName: keyof InputCollectionName;
  placeholder: string;
  tooltipLabel: string;
  title: string;
  appendFn: (item: Referanse) => void;
  register: UseFormRegister<VedtakinfoForm>;
  watch: UseFormWatch<VedtakinfoForm>;
}) => {
  function clearInput(element: HTMLInputElement) {
    element.value = "";
  }

  console.log("default values refinput", defaultValues);
  return (
    <VedtakinfoRow tooltipLabel={tooltipLabel} name={title}>
      {/* <Input {...register(collectionRegisterName)} hidden /> */}
      <Input
        {...register(registerName)}
        placeholder={placeholder}
        backgroundColor={"white"}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            const element = e.target as HTMLInputElement;
            if (element?.value) {
              // const newVals = [...collection, { beskrivelse: element.value }];
              // setValue(collectionRegisterName, newVals);
              // console.log(collection);
              appendFn({ beskrivelse: element.value });
              clearInput(element);
            }
          }
        }}
      />
      <LeggTilKnapp
        onClick={() => {
          const element = document.querySelector(
            `input[name=${registerName}]`,
          ) as HTMLInputElement;
          if (element?.value) {
            // const newVals = [...collection, { beskrivelse: element.value }];
            // setValue(collectionRegisterName, newVals);
            // console.log(collection);
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
