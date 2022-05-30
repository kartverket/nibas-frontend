import { useState } from "react";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import { Control, useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { BlockLabel, Container, Part } from "../metadataComponents";
import useIsMetadataDisabled from "../useIsMetadataDisabled";
import { updateGrenser } from "api/grenser";
import Button from "components/form/Button";
import Input from "components/form/Input";
import { ReactComponent as Minus } from "icons/minus.svg";
import { ReactComponent as Pluss } from "icons/pluss.svg";
import { Dokref, FeatureProperties, Metadata } from "types/api";

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
  disabled: boolean;
  name:
    | `dokrefs.${number}.dokumentlenker`
    | `dokrefs.${number}.internReferanserKartverket`;
};

const FieldArray = ({ control, name, itemName, disabled }: FieldArrayProps) => {
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

    append({ beskrivelse: newLenke });
    setNewLenke("");
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
              icon={<Minus />}
              onClick={() => remove(nestedIndex)}
              disabled={disabled}
            >
              {t("action.Slett")}
            </Button>
          </div>
        </FieldWrapper>
      ))}
      <div>
        <BlockLabel>
          {t("action.Ny {{ item }}", { item: "URL" })}
          <Input
            value={newLenke}
            onChange={(e) => setNewLenke(e.target.value)}
            placeholder="URL"
            onKeyPress={onKeyPress}
            disabled={disabled}
          />
        </BlockLabel>
        <Button onClick={onAdd} disabled={!newLenke} icon={<Pluss />}>
          {t("action.Legg til")}
        </Button>
      </div>
    </FieldArrayWrapper>
  );
};

type Props = {
  feature: Feature<Geometry>;
};

const GrenseMetadataReferanser = ({ feature }: Props) => {
  const { tokenHolderFunc } = useAuthenticationFlow();
  const { t } = useTranslation();

  const properties = feature.getProperties() as FeatureProperties;
  const dokrefs = (properties.metadata as Metadata).dokumentasjonsreferanser;

  const { register, handleSubmit, control } = useForm<Inputs>({
    defaultValues: { dokrefs: mapFromApiToForm(dokrefs) },
  });
  const { append, fields, remove } = useFieldArray({
    control,
    name: "dokrefs",
  });

  const disabled = useIsMetadataDisabled(properties);

  const onSubmit = handleSubmit((data) => {
    const newProperties: FeatureProperties = {
      ...properties,
      metadata: {
        ...properties.metadata,
        dokumentasjonsreferanser: mapFromFormToApi(data),
      } as Metadata,
    };

    feature.setProperties(newProperties);

    updateGrenser([feature], tokenHolderFunc()?.token);
  });

  return (
    <form onSubmit={onSubmit}>
      {fields.map((field, i) => (
        <DokRefWrapper key={field.id}>
          <Container>
            <Part>
              <BlockLabel>
                {t("metadata.Rettskildetittel")}
                <Input
                  {...register(`dokrefs.${i}.rettskildeTittel`, { disabled })}
                />
              </BlockLabel>
              <BlockLabel>
                {t("metadata.Rettskilde-ID")}
                <Input
                  {...register(`dokrefs.${i}.rettskildeId`, { disabled })}
                />
              </BlockLabel>
            </Part>
            <Part>
              <BlockLabel>
                {t("metadata.Fastsettingsmyndighet")}
                <Input
                  {...register(`dokrefs.${i}.fastsettingsmyndighet`, {
                    disabled,
                  })}
                />
              </BlockLabel>
              <BlockLabel>
                {t("metadata.Fastsettingsdato")}
                <Input
                  {...register(`dokrefs.${i}.fastsettingsdato`, { disabled })}
                  type="date"
                  role="textbox"
                />
              </BlockLabel>
            </Part>
            <Part>
              <BlockLabel>
                {t("metadata.Hjemmel")}
                <Input {...register(`dokrefs.${i}.hjemmel`, { disabled })} />
              </BlockLabel>
            </Part>
          </Container>
          <FieldArray
            control={control}
            name={`dokrefs.${i}.dokumentlenker`}
            itemName={t("metadata.Dokumentlenker")}
            disabled={disabled}
          />
          <FieldArray
            control={control}
            name={`dokrefs.${i}.internReferanserKartverket`}
            itemName={t("metadata.Internreferanser")}
            disabled={disabled}
          />

          <Button onClick={() => remove(i)} disabled={disabled}>
            {t("action.Slett {{ item }}", {
              item: t("metadata.Referanse").toLowerCase(),
            })}
          </Button>
        </DokRefWrapper>
      ))}
      <Button
        type="button"
        disabled={disabled}
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
      <Button type="submit" disabled={disabled}>
        {t("action.Lagre")}
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
  border-top: 2px solid ${({ theme }) => theme.colors.gray};
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

export default GrenseMetadataReferanser;
