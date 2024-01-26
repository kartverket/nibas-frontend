import {
  Badge,
  Button,
  Card,
  Grid,
  GridItem,
  Icon,
  Input,
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
import { DokrefField } from "./dokref_old/DokrefField";
import { Feature } from "ol";
import { useForm } from "react-hook-form";
import { DokrefRow } from "./DokrefRow";
import { useEffect, useState } from "react";
import { useDokumentreferanser } from "./useDokumentreferanser";
import { addCoordinateTransforms } from "ol/proj";

// TODO:
// * Vise referanseoversikt i metadata
//   ** Hente fra feature properties
//   ** Tooltip button skal bytte farge ved hover
//   ** Riktig farge på "ny referanse"
// * Modal for å legge til referanser
// * Modal for å vise referansedetaljer

export const OversiktReferanser = ({ feature }: { feature: Feature }) => {
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
      <ReferanserDetaljer isOpen={isOpen} onClose={onClose} feature={feature} />
    </div>
  );
};

const ReferanserDetaljer = ({
  isOpen,
  onClose,
  feature,
}: {
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
              Lukk
            </Button>
            <Button>Ta en kikk</Button>
          </ModalFooter>
        </BorderTop>
      </ModalContent>
    </Modal>
  );
};

export type DokrefForm = {
  apiId?: string;
  dokumentlenker: string[];
  leggTilDokumentlenke: string;
  fastsettingsdato: string;
  fastsettingsmyndighet?: string;
  hjemmel?: string;
  internreferanserKartverket: string[];
  rettskildeId?: string;
  rettskildeTittel: string;
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
                  <AntallReferanser count={0} colorScheme="gray" />
                </Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  {dokumentlenker.map((it: string) => (
                    <Card key={it}>{it}</Card>
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
                  {internreferanser.map((it: string) => (
                    <Card key={it}>{it}</Card>
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

type InputCollection = {
  dokumentlenker: string;
  internreferanserKartverket: string;
};

type InputName = {
  leggTilDokumentlenke: string;
  leggTilInternreferanse: string;
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
  appendFn: (item: string) => void;
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
              appendFn(element.value);
              clearInput(element);
            }
          }
        }}
      />
      <Button
        onClick={() => {
          const element = document.querySelector(
            `input[name=${inputName}]`,
          ) as HTMLInputElement;
          if (element?.value) {
            appendFn(element.value);
            clearInput(element);
          } else throw Error(`Kunne ikke finne inputelement: ${inputName} `);
        }}
      >
        Legg til
      </Button>
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

export const TextWithIcon = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
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
