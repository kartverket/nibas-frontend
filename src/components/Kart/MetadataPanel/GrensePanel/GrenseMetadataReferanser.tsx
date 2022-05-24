import { useState } from "react";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import { Control, useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { BlockLabel, Container, Part } from "../metadataComponents";
import Button from "components/form/Button";
import Input from "components/form/Input";
import { ReactComponent as Minus } from "icons/minus.svg";
import { ReactComponent as Pluss } from "icons/pluss.svg";
import { Dokref, Metadata } from "types/api";

type Value = {
  value: string;
};

type DokrefForm = {
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
    fastsettingsdato: dokref.fastsettingsdato,
    fastsettingsmyndighet: dokref.fastsettingsmyndighet ?? "",
    hjemmel: dokref.hjemmel ?? "",
    rettskildeId: dokref.rettskildeId ?? "",
    rettskildeTittel: dokref.rettskildeTittel,
    dokumentlenker: dokref.dokumentlenker.map((doklenke) => ({
      value: doklenke.beskrivelse,
    })),
    internReferanserKartverket: dokref.internReferanserKartverket.map(
      (internref) => ({ value: internref.beskrivelse })
    ),
  }));
};

type FieldArrayProps = {
  control: Control<Inputs>;
  itemName: string;
  name:
    | `dokrefs.${number}.dokumentlenker`
    | `dokrefs.${number}.internReferanserKartverket`;
};

const FieldArray = ({ control, name, itemName }: FieldArrayProps) => {
  const { t } = useTranslation();
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

    append({ value: newLenke });
    setNewLenke("");
  };

  return (
    <ColoredDiv>
      <FieldTitle>{itemName}</FieldTitle>
      {fields.map((field, nestedIndex) => (
        <FieldWrapper key={field.id}>
          <a href={field.value} target="_blank" rel="noreferrer">
            {field.value}
          </a>
          <div>
            <Button icon={<Minus />} onClick={() => remove(nestedIndex)}>
              {t("action.Slett")}
            </Button>
          </div>
        </FieldWrapper>
      ))}
      <form>
        <BlockLabel>
          {t("action.Ny {{ item }}", { item: "URL" })}
          <Input
            value={newLenke}
            onChange={(e) => setNewLenke(e.target.value)}
            placeholder="URL"
            onKeyPress={onKeyPress}
          />
        </BlockLabel>
        <Button
          onClick={onAdd}
          disabled={!newLenke}
          icon={<Pluss />}
          type="submit"
        >
          {t("action.Legg til")}
        </Button>
      </form>
    </ColoredDiv>
  );
};

type Props = {
  feature: Feature<Geometry>;
};

const GrenseMetadataReferanser = ({ feature }: Props) => {
  const { t } = useTranslation();
  const dokrefs = (feature.getProperties().metadata as Metadata)
    .dokumentasjonsreferanser;

  const { register, handleSubmit, control } = useForm<Inputs>({
    defaultValues: { dokrefs: mapFromApiToForm(dokrefs) },
  });
  const { append, fields, remove } = useFieldArray({
    control,
    name: "dokrefs",
  });

  const onSubmit = handleSubmit((data) => {
    console.log(data);
  });

  return (
    <form onSubmit={onSubmit}>
      {fields.map((field, i) => (
        <div key={field.id}>
          <ColoredDiv>
            <Container>
              <Part>
                <BlockLabel>
                  {t("metadata.Rettskilde-ID")}
                  <Input {...register(`dokrefs.${i}.rettskildeId`)} />
                </BlockLabel>
                <BlockLabel>
                  {t("metadata.Rettskildetittel")}
                  <Input {...register(`dokrefs.${i}.rettskildeTittel`)} />
                </BlockLabel>
              </Part>
              <Part>
                <BlockLabel>
                  {t("metadata.Fastsettingsmyndighet")}
                  <Input {...register(`dokrefs.${i}.fastsettingsmyndighet`)} />
                </BlockLabel>
                <BlockLabel>
                  {t("metadata.Fastsettingsdato")}
                  <Input
                    {...register(`dokrefs.${i}.fastsettingsdato`)}
                    type="date"
                  />
                </BlockLabel>
              </Part>
              <Part>
                <BlockLabel>
                  {t("metadata.Hjemmel")}
                  <Input {...register(`dokrefs.${i}.hjemmel`)} />
                </BlockLabel>
              </Part>
            </Container>
            <FieldArray
              control={control}
              name={`dokrefs.${i}.dokumentlenker`}
              itemName={t("metadata.Dokumentlenker")}
            />
            <FieldArray
              control={control}
              name={`dokrefs.${i}.internReferanserKartverket`}
              itemName={t("metadata.Internreferanser")}
            />

            <Button onClick={() => remove(i)}>
              {t("action.Slett {{ item }}", {
                item: t("metadata.Referanse").toLowerCase(),
              })}
            </Button>
          </ColoredDiv>
        </div>
      ))}
      <Button type="submit">{t("action.Lagre")}</Button>
      <Button
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
        {t("action.Ny {{ item }}", {
          item: t("metadata.Referanse").toLowerCase(),
        })}
      </Button>
    </form>
  );
};

const ColoredDiv = styled.div`
  border: 1px solid red;
  padding: 8px;
  margin: 8px;
`;

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

const FieldTitle = styled.h4`
  margin: 0;
  margin-bottom: 8px;
`;

export default GrenseMetadataReferanser;
