import { Datepicker, Grid, GridItem, Input } from "@kvib/react";
import { Feature } from "ol";
import { FormViewState, Referanse, VedtakinfoForm } from "./Vedtaksinformasjon";
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
  formViewState: FormViewState;
  deleteInternref: (index: number) => void;
  deleteDokref: (index: number) => void;
  control: Control<VedtakinfoForm>;
  errors: FieldErrors<VedtakinfoForm>;
  feature: Feature;
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
  formViewState,
  feature,
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
    <Grid templateColumns={"4fr 3fr"}>
      <GridItem>
        <Vedtaksfelter>
          <FieldContainer>
            <VedtakinfoField
              errors={errors.rettskildeTittel}
              formViewState={formViewState}
              tooltipLabel="Navn på lov, forskrift, vedtak, dom eller traktat."
              title="Vedtakstittel"
              value={vedtaksinformasjon?.rettskildeTittel}
              errorMessage={"Feltet kan ikke inneholde mer enn 250 tegn."}
            >
              <Input
                {...register("rettskildeTittel", {
                  required: "Feltet er påkrevd",
                  maxLength: 250,
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
                      formViewState={formViewState}
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
                formViewState={formViewState}
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
                      formViewState={formViewState}
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
                      formViewState={formViewState}
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
              maxWidth="500px"
              errors={errors.hjemmel}
              formViewState={formViewState}
              tooltipLabel="Lov som rettskilden er begrunnet i."
              title="Hjemmel (frivillig)"
              value={vedtaksinformasjon?.hjemmel || "Ingen hjemmel satt."}
            >
              <Input {...register("hjemmel")} backgroundColor={"white"} placeholder={"Ikke spesifisert"} />
            </VedtakinfoField>
          </FieldContainer>
          <FieldContainer>
            <VedtakinfoField
              maxWidth="500px"
              errors={errors.fastsettingsmyndighet}
              formViewState={formViewState}
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
      <GridItem>
        <Referanser
          control={control}
          deleteInternref={deleteInternref}
          deleteDokref={deleteDokref}
          formViewState={formViewState}
          errors={errors}
          setError={setError}
          clearErrors={clearErrors}
          dokref={dokref}
          internref={internref}
          addDokumentlenke={addDokumentlenke}
          addInternreferanse={addInternreferanse}
        />
      </GridItem>
    </Grid>
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
  /* margin: 20px 15px 15px 0px; */
`;
