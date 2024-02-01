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
import { useDokumentreferanser } from "./useDokumentreferanser";
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
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { isUndefined } from "swr/_internal";
import { useEffect } from "react";

export const ReferanseBody = ({
  feature,
  displayMode,
  vedtaksinfoIndex,
  register,
  internref,
  dokref,
  setDokref,
  setInternref,
  watch,
  setValue,
}: {
  setValue: UseFormSetValue<VedtakinfoForm>;
  feature: Feature;
  displayMode: boolean;
  vedtaksinfoIndex?: number;
  register: UseFormRegister<VedtakinfoForm>;
  dokref?: Referanse[];
  setDokref: React.Dispatch<React.SetStateAction<Referanse[] | undefined>>;
  internref?: Referanse[];
  setInternref: React.Dispatch<React.SetStateAction<Referanse[] | undefined>>;
  watch: UseFormWatch<VedtakinfoForm>;
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

  return (
    <>
      <Grid templateColumns={"4fr 3fr"}>
        <GridItem>
          <Vedtaksfelter>
            <VedtakinfoField
              displayMode={displayMode}
              tooltipLabel="tooltip"
              title="Vedtakstittel"
              value={vedtaksinformasjon?.rettskildeTittel}
            >
              <Input
                {...register("rettskildeTittel")}
                backgroundColor={"white"}
                placeholder={"Skriv inn tittelen på vedtaket"}
              />
            </VedtakinfoField>
            <Row>
              <VedtakinfoField
                displayMode={displayMode}
                tooltipLabel="tooltip"
                title="Fastsettingsdato"
                value={vedtaksinformasjon?.fastsettingsdato?.toLocaleLowerCase()}
              >
                <Datepicker
                  {...register("fastsettingsdato")}
                  backgroundColor={"white"}
                  placeholder={"Velg dato"}
                />
              </VedtakinfoField>
              <VedtakinfoField
                displayMode={displayMode}
                tooltipLabel="tooltip"
                title="Rettskilde-ID"
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
              displayMode={displayMode}
              tooltipLabel="tooltip"
              title="Hjemmel"
              value={vedtaksinformasjon?.hjemmel}
            >
              <Input
                {...register("hjemmel")}
                backgroundColor={"white"}
                placeholder={"Ikke spesifisert"}
              />
            </VedtakinfoField>
            <VedtakinfoField
              displayMode={displayMode}
              tooltipLabel="tooltip"
              title="Fastsettingsmyndighet"
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
          <Referanser>
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
                      collectionRegisterName="dokumentlenker"
                      watch={watch}
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
                        urlMode={true}
                        displayMode={false}
                      />
                    ))}
                    <BorderTop />
                    <ReferanseInput
                      collectionRegisterName="internreferanserKartverket"
                      watch={watch}
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
          </Referanser>
        </GridItem>
      </Grid>
    </>
  );
};

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const Referanser = styled.div`
  margin-top: 30px;
`;

const Vedtaksfelter = styled.div`
  margin: 10px 15px 15px 0;
`;
