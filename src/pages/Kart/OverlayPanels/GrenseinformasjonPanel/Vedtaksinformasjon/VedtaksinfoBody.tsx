import { Datepicker, Grid, GridItem, Input } from "@kvib/react";
import { Feature } from "ol";
import { Referanse, VedtakinfoForm } from "./OversiktVedtaksinfo";
import { VedtakinfoField } from "./VedtakinfoField";
import { Metadata } from "types/api";
import { styled } from "styled-components";
import {
  Control,
  Controller,
  FieldErrors,
  UseFormClearErrors,
  UseFormRegister,
  UseFormSetError,
} from "react-hook-form";
import { Referanser } from "./Referanser";

type ReferanseBodyProps = {
  deleteInternref: (index: number) => void;
  deleteDokref: (index: number) => void;
  control: Control<VedtakinfoForm>;
  errors: FieldErrors<VedtakinfoForm>;
  feature: Feature;
  displayMode: boolean;
  vedtaksinfoIndex?: number;
  register: UseFormRegister<VedtakinfoForm>;
  dokref?: Referanse[];
  setDokref: React.Dispatch<React.SetStateAction<Referanse[] | undefined>>;
  internref?: Referanse[];
  setInternref: React.Dispatch<React.SetStateAction<Referanse[] | undefined>>;
  setError: UseFormSetError<VedtakinfoForm>;
  clearErrors: UseFormClearErrors<VedtakinfoForm>;
};

export const VedtaksinfoBody = ({
  feature,
  displayMode,
  vedtaksinfoIndex,
  register,
  internref,
  dokref,
  setDokref,
  setInternref,
  deleteInternref,
  deleteDokref,
  errors,
  setError,
  clearErrors,
  control,
}: ReferanseBodyProps) => {
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
    vedtaksinfoIndex !== undefined ? metadata.dokumentasjonsreferanser?.at(vedtaksinfoIndex) : undefined;

  return (
    <>
      <Grid templateColumns={"4fr 3fr"}>
        <GridItem>
          <Vedtaksfelter>
            <FieldContainer>
              <VedtakinfoField
                errors={errors.rettskildeTittel}
                displayMode={displayMode}
                tooltipLabel="Navn på lov, forskrift, vedtak, dom eller traktat."
                title="Vedtakstittel"
                value={vedtaksinformasjon?.rettskildeTittel}
              >
                <Input
                  {...register("rettskildeTittel", {
                    required: "Feltet er påkrevd",
                    maxLength: 256,
                  })}
                  backgroundColor={"white"}
                  placeholder={"Skriv inn tittelen på vedtaket"}
                />
              </VedtakinfoField>
            </FieldContainer>
            <FieldContainer>
              <Row>
                <Controller
                  rules={{ required: "Feltet er påkrevd" }}
                  control={control}
                  name="fastsettingsdato"
                  render={({ field }) => {
                    return (
                      <VedtakinfoField
                        errors={errors.fastsettingsdato}
                        displayMode={displayMode}
                        tooltipLabel="Dato for når dokumentet ble skrevet, publisert eller revidert."
                        title="Fastsettingsdato"
                        value={
                          vedtaksinformasjon?.fastsettingsdato
                            ? new Date(vedtaksinformasjon?.fastsettingsdato).toLocaleDateString("nb-NO")
                            : undefined
                        }
                      >
                        <Datepicker
                          colorScheme="blue"
                          defaultSelected={field.value}
                          onChange={(e): void => {
                            field.onChange(new Date(e.target.value));
                          }}
                        />
                      </VedtakinfoField>
                    );
                  }}
                />
                <VedtakinfoField
                  errors={errors.rettskildeId}
                  displayMode={displayMode}
                  tooltipLabel="Referanse til lov, forskrift, vedtak, dom eller traktat i form av kode som angir type dokument, dato og nummer For eksempel: LOV-2012-09-07-65."
                  title="Rettskilde-ID (frivillig)"
                  value={vedtaksinformasjon?.rettskildeId || "Ingen ID satt."}
                >
                  <Input {...register("rettskildeId")} backgroundColor={"white"} placeholder={"Ikke spesifisert"} />
                </VedtakinfoField>
              </Row>
            </FieldContainer>
            <FieldContainer>
              <Row>
                <Controller
                  control={control}
                  rules={{ required: "Feltet er påkrevd" }}
                  name="vedtakGyldigFra"
                  render={({ field }) => {
                    return (
                      <VedtakinfoField
                        errors={errors.vedtakGyldigFra}
                        displayMode={displayMode}
                        tooltipLabel="Tidspunktet når objektet oppstod i den virkelige verden"
                        title="Gyldig fra"
                        value={
                          vedtaksinformasjon?.vedtakGyldigFra
                            ? new Date(vedtaksinformasjon?.vedtakGyldigFra).toLocaleDateString("nb-NO")
                            : "Ingen gyldig fra satt."
                        }
                      >
                        <Datepicker
                          id={"vedtakGyldigFra"}
                          defaultSelected={field.value}
                          onChange={(e): void => {
                            field.onChange(new Date(e.target.value));
                          }}
                          colorScheme="blue"
                        />
                      </VedtakinfoField>
                    );
                  }}
                />
                <Controller
                  control={control}
                  name="vedtakGyldigTil"
                  render={({ field }) => {
                    return (
                      <VedtakinfoField
                        errors={errors.vedtakGyldigTil}
                        displayMode={displayMode}
                        tooltipLabel="Tidspunktet når objektet opphørte å eksistere i den virkelige verden"
                        title="Gyldig til"
                        value={
                          vedtaksinformasjon?.vedtakGyldigTil
                            ? new Date(vedtaksinformasjon?.vedtakGyldigTil).toLocaleDateString("nb-NO")
                            : "Ingen gyldig til satt."
                        }
                      >
                        <Datepicker
                          fromDate={new Date()}
                          defaultSelected={field.value}
                          onChange={(e): void => {
                            field.onChange(new Date(e.target.value));
                          }}
                          colorScheme="blue"
                        />
                      </VedtakinfoField>
                    );
                  }}
                />
              </Row>
            </FieldContainer>
            <FieldContainer>
              <VedtakinfoField
                errors={errors.hjemmel}
                displayMode={displayMode}
                tooltipLabel="Lov som rettskilden er begrunnet i."
                title="Hjemmel (frivillig)"
                value={vedtaksinformasjon?.hjemmel || "Ingen hjemmel satt."}
              >
                <Input {...register("hjemmel")} backgroundColor={"white"} placeholder={"Ikke spesifisert"} />
              </VedtakinfoField>
            </FieldContainer>
            <FieldContainer>
              <VedtakinfoField
                errors={errors.fastsettingsmyndighet}
                displayMode={displayMode}
                tooltipLabel="Offentlig instans som har fastsatt en grense."
                title="Fastsettingsmyndighet (frivillig)"
                value={vedtaksinformasjon?.fastsettingsmyndighet || "Ingen myndighet satt"}
              >
                <Input
                  {...register("fastsettingsmyndighet")}
                  backgroundColor={"white"}
                  placeholder={"Ikke spesifisert"}
                />
              </VedtakinfoField>
            </FieldContainer>
          </Vedtaksfelter>
        </GridItem>
        <GridItem minHeight={"450px"}>
          <Referanser
            control={control}
            deleteInternref={deleteInternref}
            deleteDokref={deleteDokref}
            displayMode={displayMode}
            errors={errors}
            setError={setError}
            clearErrors={clearErrors}
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

export const ReferanseItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`;

export const ReferanseCardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
`;
const FieldContainer = styled.div`
  padding: 5px 0px 5px 0px;
`;
const Row = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 20px;
`;

const Vedtaksfelter = styled.div`
  margin: 20px 15px 15px 0px;
`;
