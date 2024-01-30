import { useState } from "react";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import { Control, useFieldArray } from "react-hook-form";
import { styled } from "styled-components";
import Input from "components/Input";
import { Button } from "@kvib/react";
import { useDokumentreferanser } from "./useDokumentreferanser_old";
import { DokrefField } from "./DokrefField";
import { VedtakinfoRow } from "../Vedtaksinformasjon/VedtakinfoRow";

export type Value = {
  beskrivelse: string;
  apiId?: string;
};

export type DokrefForm = {
  apiId?: string;
  dokumentlenker: Value[];
  fastsettingsdato: string;
  fastsettingsmyndighet?: string;
  hjemmel?: string;
  internReferanserKartverket: Value[];
  rettskildeId?: string;
  rettskildeTittel: string;
};

export type Inputs = {
  dokrefs: DokrefForm[];
};
type FieldArrayProps = {
  control: Control<Inputs>;
  itemName: string;
  updateDraft: () => void;
  disabled: boolean;
  name:
    | `dokrefs.${number}.dokumentlenker`
    | `dokrefs.${number}.internReferanserKartverket`;
};

const FieldArray = ({
  control,
  name,
  itemName,
  disabled,
  updateDraft,
}: FieldArrayProps) => {
  const [newLenke, setNewLenke] = useState("");
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;

    e.preventDefault();
    onAdd();
  };

  const onAdd = () => {
    if (!newLenke) return;

    append({ beskrivelse: newLenke });
    setNewLenke("");
    updateDraft();
  };

  return (
    <FieldArrayWrapper>
      <VedtakinfoRow tooltipLabel={itemName} name={itemName}>
        {fields.map((field, nestedIndex) => (
          <FieldWrapper key={field.id}>
            <a href={field.beskrivelse} target="_blank" rel="noreferrer">
              {field.beskrivelse}
            </a>
            <div>
              <Button
                rightIcon="remove"
                onClick={() => remove(nestedIndex)}
                isDisabled={disabled}
              >
                Slett
              </Button>
            </div>
          </FieldWrapper>
        ))}
        <div>
          <Input
            label="Ny URL"
            value={newLenke}
            onChange={(e) => setNewLenke(e.target.value)}
            placeholder="URL"
            onKeyDown={onKeyDown}
            isDisabled={disabled}
          />
          <Button onClick={onAdd} isDisabled={!newLenke} rightIcon="add">
            Legg til
          </Button>
        </div>
      </VedtakinfoRow>
    </FieldArrayWrapper>
  );
};

type Props = {
  feature: Feature<Geometry>;
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;

const Part = styled.div`
  flex: 1;
  margin: 0 16px;

  &:first-child,
  &:last-child {
    margin: 0;
  }
`;

const MetadataReferanser = ({ feature }: Props) => {
  const metadataIsDisabled = false; //useIsMetadataDisabled(feature, properties);
  const { control, updateDraftFromFeature } = useDokumentreferanser(feature);

  return (
    <>
      <DokRefWrapper>
        <Container>{feature.getProperties()?.metadata}</Container>
        {/* <FieldArray
          control={control}
          name={"dokrefs"}
          itemName="Dokumentlenker"
          disabled={metadataIsDisabled}
          updateDraft={updateDraftFromFeature}
        />
        <FieldArray
          control={control}
          name={"dokrefs"}
          itemName="Internreferanser"
          disabled={metadataIsDisabled}
          updateDraft={updateDraftFromFeature}
        /> */}
      </DokRefWrapper>
      <Button onClick={() => updateDraftFromFeature()}>Lagre</Button>
    </>
  );
};

const FieldWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;

  a {
    font-size: 14px;
  }

  > :first-child {
    margin-right: 8px;
  }
`;

const DokRefWrapper = styled.div`
  border-top: 2px solid var(--kvib-colors-gray-500);
  margin-top: 16px;
  padding-top: 8px;
  margin-bottom: 16px;

  &:first-child {
    margin-top: 0;
    padding-top: 0;
    border-top: none;
  }
`;

const FieldArrayWrapper = styled.fieldset`
  margin-bottom: 16px;
`;

export default MetadataReferanser;
