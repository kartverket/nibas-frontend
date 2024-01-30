import { Button, Input } from "@kvib/react";
import { VedtakinfoRow } from "./VedtakinfoRow";
import { InputName, Referanse, VedtakinfoForm } from "./OversiktReferanser";
import { styled } from "styled-components";
import { UseFormRegister } from "react-hook-form";

export const ReferanseInput = ({
  registerName,
  placeholder,
  tooltipLabel,
  title,
  appendFn,
  register,
}: {
  registerName: keyof InputName;
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
      <Input
        {...register(registerName)}
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
            `input[name=${registerName}]`,
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
