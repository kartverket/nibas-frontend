import {
  Card,
  Datepicker,
  Grid,
  GridItem,
  IconButton,
  Input,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@kvib/react";
import { Feature } from "ol";
import { Referanse, VedtakinfoForm } from "./OversiktReferanser";
import { ReferanseCard } from "./ReferanseCard";
import { AntallReferanser } from "./AntallReferanser";
import { ReferanseInput } from "./ReferanseInput";
import { VedtakinfoField } from "./VedtakinfoField";
import { Metadata } from "types/api";
import { styled } from "styled-components";
import {
  Control,
  Controller,
  FieldErrors,
  UseFormRegister,
} from "react-hook-form";
import { useState } from "react";

export const ReferanseBody = ({
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
}: {
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
              <Controller
                rules={{ required: "Feltet er påkrevd" }}
                control={control}
                name="fastsettingsdato"
                render={({ field }) => {
                  return (
                    <VedtakinfoField
                      errors={errors.fastsettingsdato}
                      displayMode={displayMode}
                      tooltipLabel="tooltip"
                      title="Fastsettingsdato"
                      value={
                        vedtaksinformasjon?.fastsettingsdato
                          ? new Date(
                              vedtaksinformasjon?.fastsettingsdato,
                            ).toLocaleDateString("nb-NO")
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
                tooltipLabel="tooltip"
                title="Rettskilde-ID (frivillig)"
                value={vedtaksinformasjon?.rettskildeId || "Ingen ID satt."}
              >
                <Input
                  {...register("rettskildeId")}
                  backgroundColor={"white"}
                  placeholder={"Ikke spesifisert"}
                />
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
                      tooltipLabel="tooltip"
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
              tooltipLabel="tooltip"
              title="Hjemmel (frivillig)"
              value={vedtaksinformasjon?.hjemmel || "Ingen hjemmel satt."}
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
              value={
                vedtaksinformasjon?.fastsettingsmyndighet ||
                "Ingen myndighet satt"
              }
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

const Referanser = ({
  dokref,
  internref,
  addInternreferanse,
  addDokumentlenke,
  register,
  errors,
  displayMode,
  deleteInternref,
  deleteDokref,
}: {
  deleteInternref: (index: number) => void;
  deleteDokref: (index: number) => void;
  displayMode: boolean;
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
      <Card variant={"filled"} height={"100%"}>
        <Tabs colorScheme="blue" size="md" width={"100%"} height="100%">
          <TabList width={"100%"}>
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
          <TabPanels width="100%" height="100%">
            <TabPanel height="100%">
              <Column>
                <ReferanserPaginated
                  deleteRef={(index) => deleteDokref(index)}
                  referanser={dokref}
                  urlMode={true}
                  displayMode={displayMode}
                />
                {!displayMode && (
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
                )}
              </Column>
            </TabPanel>
            <TabPanel height="100%">
              <Column>
                <ReferanserPaginated
                  deleteRef={(index) => deleteInternref(index)}
                  referanser={internref}
                  urlMode={false}
                  displayMode={displayMode}
                />
                {!displayMode && (
                  <ReferanseInput
                    errors={errors.leggTilInternreferanse}
                    register={register}
                    appendFn={addInternreferanse}
                    registerName="leggTilInternreferanse"
                    tooltipLabel="Tooltip"
                    placeholder="Internreferanse"
                    title="Legg til ny internreferanse"
                  />
                )}
              </Column>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Card>
    </ReferanserWrapper>
  );
};

const ReferanserPaginated = ({
  referanser,
  urlMode,
  displayMode,
  deleteRef,
}: {
  deleteRef: (index: number) => void;
  referanser: Referanse[] | undefined;
  displayMode: boolean;
  urlMode: boolean;
}) => {
  const [page, setPage] = useState(0);
  const pageSize = displayMode ? 4 : 3;
  const startIndex = Math.floor(page * pageSize);
  const displayItems = structuredClone(referanser);
  const itemsToShow = displayItems?.splice(startIndex, pageSize);
  const numberOfPages =
    referanser && referanser.length > 0
      ? Math.ceil(referanser.length / pageSize)
      : 1;
  return (
    <ReferanseItemsContainer>
      <ReferanseCardWrapper>
        {itemsToShow && itemsToShow.length > 0
          ? itemsToShow?.map((ref: Referanse, index: number) => (
              <ReferanseCard
                key={ref.beskrivelse}
                referanse={ref}
                urlMode={urlMode}
                displayMode={displayMode}
                deleteRef={() => {
                  deleteRef(page * pageSize + index);
                }}
              />
            ))
          : "Det finnes ingen dokumenter for denne referansen"}
      </ReferanseCardWrapper>
      <PaginationRow>
        <IconButton
          aria-label="Forrige side"
          variant="secondary"
          size="xs"
          icon="chevron_left"
          width="24px"
          height="24px"
          onClick={() => {
            if (page <= 0) return;
            setPage(page - 1);
          }}
        >
          left
        </IconButton>
        <Text>
          Side {page + 1} av {numberOfPages}
        </Text>
        <IconButton
          width="24px"
          height="24px"
          aria-label="Neste side"
          variant="secondary"
          size="xs"
          icon="chevron_right"
          onClick={() => {
            if (page + 1 >= numberOfPages) return;
            setPage(page + 1);
          }}
        >
          right
        </IconButton>
      </PaginationRow>
    </ReferanseItemsContainer>
  );
};

const ReferanseItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`;

const PaginationRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
`;
const ReferanseCardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
`;
const Column = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 90%;
`;

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
  margin-left: 30px;
  height: 90%;
`;

const Vedtaksfelter = styled.div`
  margin: 10px 15px 15px 0px;
`;
