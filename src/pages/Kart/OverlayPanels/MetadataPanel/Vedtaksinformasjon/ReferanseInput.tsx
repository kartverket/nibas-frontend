import { Button, Input } from "@kvib/react";
import { Feature } from "ol";
import { DokrefRow } from "./DokrefRow";
import { useDokumentreferanser } from "./useDokumentreferanser";
import { InputName, InputCollection, Referanse } from "./OversiktReferanser";
import { styled } from "styled-components";

export const ReferanseInput = ({
  feature,
  inputName,
  inputCollectionName,
  placeholder,
  tooltipLabel,
  title,
  appendFn,
}: {
  feature: Feature;
  inputName: keyof InputName;
  inputCollectionName: keyof InputCollection;
  placeholder: string;
  tooltipLabel: string;
  title: string;
  appendFn: (item: Referanse) => void;
}) => {
  const { register } = useDokumentreferanser(feature);

  function clearInput(element: HTMLInputElement) {
    element.value = "";
  }
  return (
    <DokrefRow tooltipLabel={tooltipLabel} name={title}>
      <Input
        hidden
        placeholder={placeholder}
        {...register(inputCollectionName)}
      />
      <Input
        {...register(inputName)}
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
    </DokrefRow>
  );
};

const LeggTilKnapp = styled(Button)`
  margin-left: 20px;
`;
