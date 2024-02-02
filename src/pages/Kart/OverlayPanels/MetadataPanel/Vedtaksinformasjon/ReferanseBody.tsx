import {
  Card,
  Datepicker,
  Grid,
  GridItem,
  Input,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@kvib/react";
import { Feature } from "ol";
import { useVedtaksinfoForm } from "./useVedtaksinfoForm";
import {
  BorderBottom,
  BorderTop,
  Referanse,
  VedtakinfoForm,
} from "./OversiktReferanser";
import { ReferanseCard } from "./ReferanseCard";
import { AntallReferanser } from "./AntallReferanser";
import { ReferanseInput } from "./ReferanseInput";
import { VedtakinfoField } from "./VedtakinfoField";
import { Metadata } from "types/api";
import styled from "styled-components";
import {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { isUndefined } from "swr/_internal";
import { useEffect, useState } from "react";
import { add } from "date-fns";

export const ReferanseBody = ({
  feature,
  displayMode,
  vedtaksinfoIndex,
  register,
  internref,
  dokref,
  setDokref,
  setInternref,
  errors,
  setFastsettingsdato,
}: {
  setFastsettingsdato: (date: string) => void;
  errors: FieldErrors<VedtakinfoForm>;
  feature: Feature;
  displayMode: boolean;
  vedtaksinfoIndex?: number;
  register: UseFormRegister<VedtakinfoForm>;
  dokref?: Referanse[];
  setDokref: React.Dispatch<React.SetStateAction<Referanse[] | undefined>>;
  internref?: Referanse[];
  setInternref: React.Dispatch<React.SetStateAction<Referanse[] | undefined>>;
}) => {
  const addDokumentlenke = (lenke: Referanse) => {
    setDokref((prevState) => {
      if (prevState !== undefined) {
        return [...prevState, lenke];
      } else return [lenke];
    });
  };

  const addInternreferanse = (lenke: Referanse) => {
    setInternref((prevState) => {
      if (prevState !== undefined) {
        return [...prevState, lenke];
      } else return [lenke];
    });
  };

  const metadata = feature.getProperties().metadata as Metadata;
  const vedtaksinformasjon =
    vedtaksinfoIndex !== undefined
      ? metadata.dokumentasjonsreferanser?.at(vedtaksinfoIndex)
      : undefined;

  console.log("vedtaksinfo body", vedtaksinformasjon);
  const addDate = () => {
    const dateField = document.getElementById(
      "fastsettingsdato",
    ) as HTMLInputElement;

    if (dateField.value) {
      return new Date(dateField.value);
    } else return new Date();
  };

  return (
    <>
      <Grid templateColumns={"4fr 3fr"}>
        <GridItem>
          <Vedtaksfelter>
            <VedtakinfoField
              errors={errors.rettskildeTittel}
              displayMode={displayMode}
              tooltipLabel="tooltip"
              title="Vedtakstittel"
              value={vedtaksinformasjon?.rettskildeTittel}
            >
              <Input
                {...register("rettskildeTittel", {
                  required: "Feltet er påkrevd",
                })}
                backgroundColor={"white"}
                placeholder={"Skriv inn tittelen på vedtaket"}
              />
            </VedtakinfoField>
            <Row>
              <VedtakinfoField
                errors={errors.fastsettingsdato}
                displayMode={displayMode}
                tooltipLabel="tooltip"
                title="Fastsettingsdato"
                value={vedtaksinformasjon?.fastsettingsdato?.toLocaleLowerCase()}
              >
                <Input
                  {...register("fastsettingsdato")}
                  id="fastsettingsdato"
                  hidden
                />

                <Datepicker
                  onChange={(e) => {
                    setFastsettingsdato(e.target.value);
                  }}
                />
              </VedtakinfoField>
              <VedtakinfoField
                errors={errors.rettskildeId}
                displayMode={displayMode}
                tooltipLabel="tooltip"
                title="Rettskilde-ID (frivillig)"
                value={vedtaksinformasjon?.rettskildeId}
              >
                <Input
                  {...register("rettskildeId")}
                  backgroundColor={"white"}
                  placeholder={"Ikke spesifisert"}
                />
              </VedtakinfoField>
            </Row>
            <VedtakinfoField
              errors={errors.hjemmel}
              displayMode={displayMode}
              tooltipLabel="tooltip"
              title="Hjemmel (frivillig)"
              value={vedtaksinformasjon?.hjemmel}
            >
              <Input
                {...register("hjemmel")}
                backgroundColor={"white"}
                placeholder={"Ikke spesifisert"}
              />
            </VedtakinfoField>
            <VedtakinfoField
              errors={errors.fastsettingsmyndighet}
              displayMode={displayMode}
              tooltipLabel="tooltip"
              title="Fastsettingsmyndighet (frivillig)"
              value={vedtaksinformasjon?.fastsettingsmyndighet}
            >
              <Input
                {...register("fastsettingsmyndighet")}
                backgroundColor={"white"}
                placeholder={"Ikke spesifisert"}
              />
            </VedtakinfoField>
          </Vedtaksfelter>
        </GridItem>
        <GridItem>
          <Referanser
            errors={errors}
            register={register}
            dokref={dokref}
            internref={internref}
            addDokumentlenke={addDokumentlenke}
            addInternreferanse={addInternreferanse}
          />
        </GridItem>
      </Grid>
    </>
  );
};

const Referanser = ({
  dokref,
  internref,
  addInternreferanse,
  addDokumentlenke,
  register,
  errors,
}: {
  dokref: Referanse[] | undefined;
  internref: Referanse[] | undefined;
  addInternreferanse: (ref: Referanse) => void;
  addDokumentlenke: (ref: Referanse) => void;
  register: UseFormRegister<VedtakinfoForm>;
  errors: FieldErrors<VedtakinfoForm>;
}) => {
  const regexUrlPattern =
    /(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?\/[a-zA-Z0-9]{2,}|((https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?)|(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}(\.[a-zA-Z0-9]{2,})?/g;

  return (
    <ReferanserWrapper>
      <Card variant={"filled"}>
        <BorderBottom />
        <Tabs colorScheme="blue" size="md">
          <TabList>
            <Tab>
              Dokumenter
              <AntallReferanser
                count={dokref?.length || 0}
                colorScheme="blue"
              />
            </Tab>
            <Tab>
              Interne referanser
              <AntallReferanser
                count={internref?.length || 0}
                colorScheme="gray"
              />
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              {dokref?.map((ref: Referanse) => (
                <ReferanseCard
                  key={ref.beskrivelse}
                  referanse={ref}
                  urlMode={true}
                  displayMode={false}
                />
              ))}

              <BorderTop />
              <ReferanseInput
                errors={errors.leggTilDokumentlenke}
                pattern={regexUrlPattern}
                register={register}
                appendFn={addDokumentlenke}
                registerName="leggTilDokumentlenke"
                tooltipLabel="Tooltip"
                placeholder="URL til dokument"
                title="Legg til nytt dokument (URL)"
              />
            </TabPanel>
            <TabPanel>
              {internref?.map((ref: Referanse) => (
                <ReferanseCard
                  key={ref.beskrivelse}
                  referanse={ref}
                  urlMode={false}
                  displayMode={false}
                />
              ))}
              <BorderTop />
              <ReferanseInput
                errors={errors.leggTilInternreferanse}
                register={register}
                appendFn={addInternreferanse}
                registerName="leggTilInternreferanse"
                tooltipLabel="Tooltip"
                placeholder="Internreferanse"
                title="Legg til ny internreferanse"
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Card>
    </ReferanserWrapper>
  );
};

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 20px;
  margin: 0px;
  padding: 0px;
`;

const ReferanserWrapper = styled.div`
  margin-top: 30px;
`;

const Vedtaksfelter = styled.div`
  margin: 10px 15px 15px 0px;
`;
