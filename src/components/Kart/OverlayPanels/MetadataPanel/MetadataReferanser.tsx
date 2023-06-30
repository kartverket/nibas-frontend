import { useEffect, useState } from "react";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import LineString from "ol/geom/LineString";
import { ObjectEvent } from "ol/Object";
import { Control, useFieldArray, useForm } from "react-hook-form";
import styled from "styled-components";
import { addMetadataEntryFromFeature } from "./utils";
import Input from "components/Input";
import Icon from "components/Icon";
import { useHistory } from "contexts/HistoryContext";
import { Dokref, FeatureProperties, Metadata } from "types/api";
import useIsMetadataDisabled from "../hooks/useIsMetadataDisabled";
import { Button } from "@kvib/react";

type Value = {
  beskrivelse: string;
  apiId?: string;
};

type DokrefForm = {
  apiId?: string;
  dokumentlenker: Value[];
  fastsettingsdato: string;
  fastsettingsmyndighet: string;
  hjemmel: string;
  internReferanserKartverket: Value[];
  rettskildeId: string;
  rettskildeTittel: string;
};

type Inputs = {
  dokrefs: DokrefForm[];
};

const mapFromApiToForm = (dokrefs: Dokref[] = []): DokrefForm[] => {
  return dokrefs.map((dokref) => ({
    apiId: dokref.id,
    fastsettingsdato: dokref.fastsettingsdato,
    fastsettingsmyndighet: dokref.fastsettingsmyndighet ?? "",
    hjemmel: dokref.hjemmel ?? "",
    rettskildeId: dokref.rettskildeId ?? "",
    rettskildeTittel: dokref.rettskildeTittel,
    dokumentlenker: dokref.dokumentlenker.map((lenke) => ({
      apiId: lenke.id,
      beskrivelse: lenke.beskrivelse,
    })),
    internReferanserKartverket: dokref.internReferanserKartverket.map(
      (ref) => ({
        apiId: ref.id,
        beskrivelse: ref.beskrivelse,
      })
    ),
  }));
};

const mapFromFormToApi = (data: Inputs): Dokref[] => {
  return data.dokrefs.map((dokref) => ({
    id: dokref.apiId,
    rettskildeTittel: dokref.rettskildeTittel,
    fastsettingsdato: dokref.fastsettingsdato,
    fastsettingsmyndighet: dokref.fastsettingsmyndighet,
    hjemmel: dokref.hjemmel,
    rettskildeId: dokref.rettskildeId,
    dokumentlenker: dokref.dokumentlenker.map((lenke) => ({
      id: lenke.apiId,
      beskrivelse: lenke.beskrivelse,
    })),
    internReferanserKartverket: dokref.internReferanserKartverket.map(
      (ref) => ({
        id: ref.apiId,
        beskrivelse: ref.beskrivelse,
      })
    ),
  }));
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

  const onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
      <FieldTitle>{itemName}</FieldTitle>
      {fields.map((field, nestedIndex) => (
        <FieldWrapper key={field.id}>
          <a href={field.beskrivelse} target="_blank" rel="noreferrer">
            {field.beskrivelse}
          </a>
          <div>
            <Button
              rightIcon={<Icon icon="remove" />}
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
          onKeyPress={onKeyPress}
          isDisabled={disabled}
        />
        <Button
          onClick={onAdd}
          isDisabled={!newLenke}
          rightIcon={<Icon icon="add" />}
        >
          Legg til
        </Button>
      </div>
    </FieldArrayWrapper>
  );
};

type Props = {
  feature: Feature<Geometry>;
};

const Container = styled.div`
  display: flex;
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
  const properties = feature.getProperties() as FeatureProperties;
  const dokrefs = (properties.metadata as Metadata).dokumentasjonsreferanser;

  const { register, control, setValue, getValues } = useForm<Inputs>({
    defaultValues: { dokrefs: mapFromApiToForm(dokrefs) },
  });
  const { append, fields, remove } = useFieldArray({
    control,
    name: "dokrefs",
  });

  const { addHistoryEntry } = useHistory();

  useEffect(() => {
    const updateFormOnPropertyChange = (e: ObjectEvent) => {
      const newMetadata = (e.target as Feature<LineString>).getProperties()
        .metadata as Metadata;

      setValue(
        "dokrefs",
        mapFromApiToForm(newMetadata.dokumentasjonsreferanser)
      );
    };

    feature.on("propertychange", updateFormOnPropertyChange);

    return () => {
      feature.un("propertychange", updateFormOnPropertyChange);
    };
  }, [feature, setValue]);

  const updateDraftFromFeature = () => {
    const metadata = feature.getProperties().metadata as Metadata;
    addMetadataEntryFromFeature(
      feature as Feature<LineString>,
      addHistoryEntry,
      {
        ...metadata,
        dokumentasjonsreferanser: mapFromFormToApi(getValues()),
      }
    );
  };

  const metadataIsDisabled = useIsMetadataDisabled(properties);

  return (
    <form>
      {fields.map((field, i) => (
        <DokRefWrapper key={field.id}>
          <Container>
            <Part>
              <Input
                label="Rettskildetittel"
                {...register(`dokrefs.${i}.rettskildeTittel`, {
                  onChange: updateDraftFromFeature,
                  disabled: metadataIsDisabled,
                })}
              />
              <Input
                label="Rettskilde-ID"
                {...register(`dokrefs.${i}.rettskildeId`, {
                  onChange: updateDraftFromFeature,
                  disabled: metadataIsDisabled,
                })}
              />
            </Part>
            <Part>
              <Input
                label="Fastsettingsmyndighet"
                {...register(`dokrefs.${i}.fastsettingsmyndighet`, {
                  onChange: updateDraftFromFeature,
                  disabled: metadataIsDisabled,
                })}
              />
              <Input
                label="Fastsettingsdato"
                {...register(`dokrefs.${i}.fastsettingsdato`, {
                  onChange: updateDraftFromFeature,
                  disabled: metadataIsDisabled,
                })}
                type="date"
                role="textbox"
              />
            </Part>
            <Part>
              <Input
                label="Hjemmel"
                {...register(`dokrefs.${i}.hjemmel`, {
                  onChange: updateDraftFromFeature,
                  disabled: metadataIsDisabled,
                })}
              />
            </Part>
          </Container>
          <FieldArray
            control={control}
            name={`dokrefs.${i}.dokumentlenker`}
            itemName="Dokumentlenker"
            disabled={metadataIsDisabled}
            updateDraft={updateDraftFromFeature}
          />
          <FieldArray
            control={control}
            name={`dokrefs.${i}.internReferanserKartverket`}
            itemName="Internreferanser"
            disabled={metadataIsDisabled}
            updateDraft={updateDraftFromFeature}
          />

          <Button onClick={() => remove(i)} isDisabled={metadataIsDisabled}>
            Slett referanse
          </Button>
        </DokRefWrapper>
      ))}
      <Button
        isDisabled={metadataIsDisabled}
        onClick={() =>
          append({
            dokumentlenker: [],
            internReferanserKartverket: [],
            fastsettingsdato: "",
            fastsettingsmyndighet: "",
            hjemmel: "",
            rettskildeId: "",
            rettskildeTittel: "",
          })
        }
      >
        Ny referanse
      </Button>
    </form>
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

const FieldTitle = styled.legend`
  margin: 0;
  margin-bottom: 8px;
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
