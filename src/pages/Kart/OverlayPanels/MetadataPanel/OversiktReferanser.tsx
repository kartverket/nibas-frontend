import {
  Badge,
  Button,
  Card,
  Grid,
  GridItem,
  Icon,
  Input,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Tooltip,
  useDisclosure,
} from "@kvib/react";
import { styled } from "styled-components";
import { InfoIcon } from "./MetadataGenerelt";
import { Feature } from "ol";
import { DokrefRow } from "./DokrefRow";
import { useDokumentreferanser } from "./useDokumentreferanser";

// TODO:
// * Vise referanseoversikt i metadata
//   ** Hente fra feature properties
//   ** Tooltip button skal bytte farge ved hover
//   ** Riktig farge på "ny referanse"
// * Modal for å legge til referanser
//   ** legge til URLer                                     OK
//   ** legge til referanser                                OK
//   ** resterende felter
//   ** oppdatere historikk
// * Modal for å vise referansedetaljer
//   ** sendes med fra feature
//   ** helst gjenbruke modal og skjema

type Referanse = {
  beskrivelse: string;
  apiId?: string;
};

type DokrefForm = {
  apiId?: string;
  dokumentlenker: Referanse[];
  leggTilDokumentlenke?: string;
  fastsettingsdato: string;
  fastsettingsmyndighet?: string;
  hjemmel?: string;
  internreferanserKartverket: Referanse[];
  leggTilInternreferanse?: string;
  rettskildeId?: string;
  rettskildeTittel: string;
};

type InputCollection = {
  dokumentlenker: string;
  internreferanserKartverket: string;
};

type InputName = {
  leggTilDokumentlenke: string;
  leggTilInternreferanse: string;
};

const OversiktReferanser = ({ feature }: { feature: Feature }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <div>
      <Tooltip label={"tooltipLabel"} hasArrow placement="bottom">
        <OversiktHeader>
          <Text as="b">Dokumentreferanser</Text>
          <InfoIcon>
            <Icon
              size={24}
              color="var(--kvib-colors-blue-500)"
              isFilled={true}
              icon={"info"}
            ></Icon>
          </InfoIcon>
          <EditButton
            colorScheme="gray"
            aria-label="Legg til dokumentreferanse"
            onClick={onOpen}
          >
            <p>Ny referanse</p>
            <Icon icon="add" />
          </EditButton>
        </OversiktHeader>
      </Tooltip>
      <ReferanserDetaljer
        isOpen={isOpen}
        onClose={onClose}
        feature={feature}
        displayMode={false}
      />
    </div>
  );
};

const ReferanserDetaljer = ({
  isOpen,
  onClose,
  feature,
  displayMode,
}: {
  displayMode: boolean;
  feature: Feature;
  isOpen: boolean;
  onClose: () => void;
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size={"5xl"}>
      <ModalContent>
        <BorderBottom>
          <ModalHeader>Model header</ModalHeader>
        </BorderBottom>
        <ModalCloseButton />
        <ModalBody>
          <ReferanseBody feature={feature} />
        </ModalBody>

        <BorderTop>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Avbryt
            </Button>
            <Button>Bekreft</Button>
          </ModalFooter>
        </BorderTop>
      </ModalContent>
    </Modal>
  );
};

const ReferanseBody = ({ feature }: { feature: Feature }) => {
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
                  {dokumentlenker.map((it: Referanse) => (
                    <ReferanseCard
                      key={it.beskrivelse}
                      ref={it}
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
                  {internreferanser.map((it: Referanse) => (
                    <Card key={it.beskrivelse}>{it.beskrivelse}</Card>
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

const ReferanseInput = ({
  feature,
  inputName,
  inputCollectionName,
  placeholder,
  tooltipLabel,
  title,
  appendFn,
}: {
  feature: Feature;
  inputName: keyof InputName;
  inputCollectionName: keyof InputCollection;
  placeholder: string;
  tooltipLabel: string;
  title: string;
  appendFn: (item: Referanse) => void;
}) => {
  const { register } = useDokumentreferanser(feature);

  function clearInput(element: HTMLInputElement) {
    element.value = "";
  }
  return (
    <DokrefRow tooltipLabel={tooltipLabel} name={title}>
      <Input
        hidden
        placeholder={placeholder}
        {...register(inputCollectionName)}
      />
      <Input
        {...register(inputName)}
        backgroundColor={"white"}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            const element = e.target as HTMLInputElement;
            if (element?.value) {
              appendFn({ beskrivelse: element.value });
              clearInput(element);
            }
          }
        }}
      />
      <LeggTilKnapp
        onClick={() => {
          const element = document.querySelector(
            `input[name=${inputName}]`,
          ) as HTMLInputElement;
          if (element?.value) {
            appendFn({ beskrivelse: element.value });
            clearInput(element);
          }
        }}
      >
        Legg til
      </LeggTilKnapp>
    </DokrefRow>
  );
};

const AntallReferanser = ({
  count,
  colorScheme,
}: {
  count: number;
  colorScheme: "blue" | "gray";
}) => {
  if (count < 0) count = 0;

  return (
    <BadgeWrapper>
      <Badge colorScheme={colorScheme} variant="solid">
        {count}
      </Badge>
    </BadgeWrapper>
  );
};

const ReferanseCard = ({
  ref,
  displayMode,
  urlMode,
}: {
  ref: Referanse;
  displayMode: boolean;
  urlMode: boolean;
}) => {
  console.log(ref);
  return (
    <Card>
      <Text>{ref.beskrivelse}</Text>
      {urlMode && (
        <Link href={ref.beskrivelse}>
          <Icon icon="open_in_new" />
        </Link>
      )}
    </Card>
  );
};
const LeggTilKnapp = styled(Button)`
  margin-left: 20px;
`;
const BadgeWrapper = styled.div`
  padding-left: 5px;
`;

const BorderTop = styled.div`
  border-top: 1px;
  border-color: var(--kvib-colors-gray-300);
  border-style: solid;
`;

const BorderBottom = styled.div`
  border-bottom: 1px;
  border-color: var(--kvib-colors-gray-300);
  border-style: solid;
`;

const EditButton = styled(Button)`
  white-space: nowrap;
  min-width: unset;
`;

const OversiktHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export type { DokrefForm, Referanse };
export { OversiktReferanser };
