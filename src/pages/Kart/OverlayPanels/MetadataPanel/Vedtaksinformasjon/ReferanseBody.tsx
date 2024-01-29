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
import { BorderBottom, BorderTop, Referanse } from "./OversiktReferanser";
import { ReferanseCard } from "./ReferanseCard";
import { AntallReferanser } from "./AntallReferanser";
import { ReferanseInput } from "./ReferanseInput";

export const ReferanseBody = ({ feature }: { feature: Feature }) => {
  const {
    dokumentlenker,
    internreferanser,
    addDokumentlenke,
    addInternreferanse,
  } = useDokumentreferanser(feature);

  return (
    <>
      <Grid templateColumns={"4fr 3fr"}>
        <GridItem>
          <p>Left</p>
        </GridItem>
        <GridItem>
          <Card variant={"filled"}>
            <BorderBottom />
            <Tabs colorScheme="blue" size="md">
              <TabList>
                <Tab>
                  Dokumenter
                  <AntallReferanser
                    count={dokumentlenker.length}
                    colorScheme="blue"
                  />
                </Tab>
                <Tab>
                  Interne referanser
                  <AntallReferanser
                    count={internreferanser.length}
                    colorScheme="gray"
                  />
                </Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  {dokumentlenker.map((ref: Referanse) => (
                    <ReferanseCard
                      key={ref.beskrivelse}
                      referanse={ref}
                      urlMode={true}
                      displayMode={false}
                    />
                  ))}

                  <BorderTop />
                  <ReferanseInput
                    appendFn={addDokumentlenke}
                    feature={feature}
                    inputName="leggTilDokumentlenke"
                    inputCollectionName="dokumentlenker"
                    tooltipLabel="Tooltip"
                    placeholder="URL til dokument"
                    title="Legg til nytt dokument (URL)"
                  />
                </TabPanel>
                <TabPanel>
                  {internreferanser.map((ref: Referanse) => (
                    <ReferanseCard
                      key={ref.beskrivelse}
                      referanse={ref}
                      urlMode={true}
                      displayMode={false}
                    />
                  ))}
                  <BorderTop />
                  <ReferanseInput
                    appendFn={addInternreferanse}
                    feature={feature}
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
        </GridItem>
      </Grid>
    </>
  );
};
