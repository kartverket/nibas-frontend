import { styled } from "styled-components";
import { Referanse, VedtakinfoForm } from "./OversiktReferanser";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import { Card, Tab, TabList, TabPanel, TabPanels, Tabs } from "@kvib/react";
import { AntallReferanser } from "./AntallReferanser";
import { ReferanserPaginated } from "./ReferanserPaginated";
import { ReferanseInput } from "./ReferanseInput";
export type ReferanserProps = {
  deleteInternref: (index: number) => void;
  deleteDokref: (index: number) => void;
  displayMode: boolean;
  dokref: Referanse[] | undefined;
  internref: Referanse[] | undefined;
  addInternreferanse: (ref: Referanse) => void;
  addDokumentlenke: (ref: Referanse) => void;
  register: UseFormRegister<VedtakinfoForm>;
  errors: FieldErrors<VedtakinfoForm>;
};

export const Referanser = ({
  dokref,
  internref,
  addInternreferanse,
  addDokumentlenke,
  register,
  errors,
  displayMode,
  deleteInternref,
  deleteDokref,
}: ReferanserProps) => {
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
                    tooltipLabel="URL til saksdokument."
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
                    tooltipLabel="Henvisning til saksdokument i Kartverkets eget arkiv Merknad: Gjelder også link til skannet dokument på intern server."
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

const ReferanserWrapper = styled.div`
  margin-top: 30px;
  margin-left: 30px;
  height: 90%;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 90%;
`;
