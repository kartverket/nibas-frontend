import {
  Card,
  Grid,
  GridItem,
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
import { UseFormRegister } from "react-hook-form";

export const ReferanseBody = ({
  feature,
  displayMode,
  vedtaksinfoId,
  register,
  internref,
  dokref,
  setDokref,
  setInternref,
}: {
  feature: Feature;
  displayMode: boolean;
  vedtaksinfoId?: string;
  register: UseFormRegister<VedtakinfoForm>;
  dokref: Referanse[];
  setDokref: React.Dispatch<React.SetStateAction<Referanse[]>>;
  internref: Referanse[];
  setInternref: React.Dispatch<React.SetStateAction<Referanse[]>>;
}) => {
  const addDokumentlenke = (lenke: Referanse) => {
    setDokref((prevState) => [...prevState, lenke]);
  };

  const addInternreferanse = (lenke: Referanse) => {
    setInternref((prevState) => [...prevState, lenke]);
  };

  const vedtaksinformasjon = displayMode
    ? undefined
    : (
        feature.getProperties().Metadata as Metadata
      )?.dokumentasjonsreferanser?.find((ref) => ref.id === vedtaksinfoId);

  const erNyVedtaksinformasjon = !vedtaksinfoId && !displayMode;

  return (
    <>
      <Grid templateColumns={"4fr 3fr"}>
        <GridItem>
          <Vedtaksfelter>
            <VedtakinfoField
              register={register}
              displayMode={displayMode}
              feature={feature}
              name="rettskildeTittel"
              placeholder={"Ikke spesifisert"}
              tooltipLabel="tooltip"
              title="Rettskildetittel (obligatorisk)"
              value={vedtaksinformasjon?.rettskildeTittel}
            />
            <VedtakinfoField
              register={register}
              displayMode={displayMode}
              feature={feature}
              name="rettskildeId"
              placeholder={"Ikke spesifisert"}
              tooltipLabel="tooltip"
              title="Rettskilde-ID"
            />
            <VedtakinfoField
              register={register}
              displayMode={displayMode}
              feature={feature}
              name="hjemmel"
              placeholder={"Ikke spesifisert"}
              tooltipLabel="tooltip"
              title="Hjemmel"
              value={vedtaksinformasjon?.hjemmel}
            />
            <VedtakinfoField
              register={register}
              displayMode={displayMode}
              feature={feature}
              name="fastsettingsmyndighet"
              placeholder={"Ikke spesifisert"}
              tooltipLabel="tooltip"
              title="Fastsettingsmyndighet"
              value={vedtaksinformasjon?.fastsettingsmyndighet}
            />
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
                      count={dokref.length}
                      colorScheme="blue"
                    />
                  </Tab>
                  <Tab>
                    Interne referanser
                    <AntallReferanser
                      count={internref.length}
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
                      register={register}
                      appendFn={addDokumentlenke}
                      inputName="leggTilDokumentlenke"
                      inputCollectionName="dokumentlenker"
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
                      register={register}
                      appendFn={addInternreferanse}
                      inputName="leggTilInternreferanse"
                      inputCollectionName="internreferanserKartverket"
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

const Referanser = styled.div`
  margin-top: 30px;
`;

const Vedtaksfelter = styled.div`
  margin: 10px 15px 15px 0;
`;
