import { Datepicker, Grid, GridItem, Input } from "@kvib/react";
import { Feature } from "ol";
import { Referanse, VedtakinfoForm } from "./OversiktReferanser";
import { VedtakinfoField } from "./VedtakinfoField";
import { Metadata } from "types/api";
import { styled } from "styled-components";
import { Control, Controller, FieldErrors, UseFormRegister } from "react-hook-form";
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
                })}
                backgroundColor={"white"}
                placeholder={"Skriv inn tittelen på vedtaket"}
              />
            </VedtakinfoField>
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
            <Row>
              <Controller
                control={control}
                name="gyldigFra"
                render={({ field }) => {
                  return (
                    <VedtakinfoField
                      errors={errors.gyldigFra}
                      displayMode={displayMode}
                      tooltipLabel="tooltip"
                      title="Gyldig fra"
                      value={"Må implementeres i backend"}
                    >
                      <Datepicker
                        defaultSelected={field.value}
                        onChange={(e): void => {
                          field.onChange(new Date(e.target.value));
                        }}
                      />
                    </VedtakinfoField>
                  );
                }}
              />
              <Controller
                control={control}
                name="gyldigTil"
                render={({ field }) => {
                  return (
                    <VedtakinfoField
                      errors={errors.gyldigTil}
                      displayMode={displayMode}
                      tooltipLabel=""
                      title="Gyldig til"
                      value={"Må implementeres i backend"}
                    >
                      <Datepicker
                        defaultSelected={field.value}
                        onChange={(e): void => {
                          field.onChange(new Date(e.target.value));
                        }}
                      />
                    </VedtakinfoField>
                  );
                }}
              />
            </Row>
            <VedtakinfoField
              errors={errors.hjemmel}
              displayMode={displayMode}
              tooltipLabel="Lov som rettskilden er begrunnet i."
              title="Hjemmel (frivillig)"
              value={vedtaksinformasjon?.hjemmel || "Ingen hjemmel satt."}
            >
              <Input {...register("hjemmel")} backgroundColor={"white"} placeholder={"Ikke spesifisert"} />
            </VedtakinfoField>
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
          </Vedtaksfelter>
        </GridItem>
        <GridItem minHeight={"450px"}>
          <Referanser
            deleteInternref={deleteInternref}
            deleteDokref={deleteDokref}
            displayMode={displayMode}
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

export const ReferanseItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`;

export const PaginationRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
`;
export const ReferanseCardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 20px;
  margin: 0px;
  padding: 0px;
`;

const Vedtaksfelter = styled.div`
  margin: 10px 15px 15px 0px;
`;
