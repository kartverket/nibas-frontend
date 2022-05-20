import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import {
  Control,
  useFieldArray,
  useForm,
  UseFormRegister,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { BlockLabel, Container, Part } from "../metadataComponents";
import Button from "components/form/Button";
import Input from "components/form/Input";
import { Dokref, Metadata } from "types/api";

type Props = {
  feature: Feature<Geometry>;
};

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
  register: UseFormRegister<Inputs>;
  index: number;
};

const Dokumentlenker = ({ control, index, register }: FieldArrayProps) => {
  const { t } = useTranslation();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `dokrefs.${index}.dokumentlenker`,
  });

  return (
    <ColoredDiv>
      {fields.map((field, nestedIndex) => (
        <div key={field.id}>
          <BlockLabel>
            Lenke
            <Input
              {...register(
                `dokrefs.${index}.dokumentlenker.${nestedIndex}.value`
              )}
            />
          </BlockLabel>
          <Button onClick={() => remove(nestedIndex)}>
            {t("action.Slett {{ item }}", {
              item: t("metadata.Dokumentlenke").toString().toLowerCase(),
            })}
          </Button>
        </div>
      ))}
      <Button onClick={() => append({ value: "" })}>
        {t("action.Legg til {{ item }}", {
          item: t("metadata.Dokumentlenke").toString().toLowerCase(),
        })}
      </Button>
    </ColoredDiv>
  );
};

const Internreferanser = ({ control, index, register }: FieldArrayProps) => {
  const { t } = useTranslation();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `dokrefs.${index}.internReferanserKartverket`,
  });

  return (
    <ColoredDiv>
      {fields.map((field, nestedIndex) => (
        <div key={field.id}>
          <BlockLabel>
            Lenke
            <Input
              {...register(
                `dokrefs.${index}.internReferanserKartverket.${nestedIndex}.value`
              )}
            />
          </BlockLabel>
          <Button onClick={() => remove(nestedIndex)}>
            {t("action.Slett {{ item }}", {
              item: t("metadata.Internreferanse").toString().toLowerCase(),
            })}
          </Button>
        </div>
      ))}
      <Button onClick={() => append({ value: "" })}>
        {t("action.Legg til {{ item }}", {
          item: t("metadata.Internreferanse").toString().toLowerCase(),
        })}
      </Button>
    </ColoredDiv>
  );
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
      <ColoredDiv>
        {fields.map((field, i) => (
          <div key={field.id}>
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
            <Dokumentlenker
              register={register}
              control={control}
              index={i}
            ></Dokumentlenker>
            <Internreferanser
              register={register}
              control={control}
              index={i}
            ></Internreferanser>

            <Button onClick={() => remove(i)}>
              {t("action.Slett {{ item }}", { item: "referanse" })}
            </Button>
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
          {t("action.Ny {{ item }}", { item: "referanse" })}
        </Button>
      </ColoredDiv>
    </form>
  );
};

const ColoredDiv = styled.div`
  border: 1px solid red;
  padding: 8px;
  margin: 8px;
`;

export default GrenseMetadataReferanser;
