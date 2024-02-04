import { Button, Card, Icon, Text, Tooltip, useDisclosure } from "@kvib/react";
import { styled } from "styled-components";
import { InfoIcon } from "../MetadataGenerelt";
import { Feature } from "ol";
import { VedtaksinfoDetaljer } from "./VedtaksinfoDetaljer";
import { Dokref, Metadata } from "types/api";
import { useState } from "react";
import { on } from "events";

// TODO:
// * Vise referanseoversikt i metadata
//   ** Hente fra feature properties                        OK
//   ** Tooltip button skal bytte farge ved hover           OK
//   ** Riktig farge på "ny referanse"
// * Modal for å legge til referanser
//   ** legge til URLer                                     OK
//      ** Validere URL
//   ** legge til referanser                                OK
//   ** resterende felter
//      ** Mangler nye datofelt
//      ** Datofelt reagerer ikke på register :S
//   ** oppdatere historikk                                 OK
//   ** implementere isDirty for referanser
// * Modal for å vise referansedetaljer
//   ** sendes med fra feature                              OK
//   ** helst gjenbruke modal og skjema                     OK
// * Slett gammel kode

type Referanse = {
  beskrivelse: string;
  id?: string;
};

type VedtakinfoForm = {
  id?: string;
  dokumentlenker: Referanse[];
  leggTilDokumentlenke?: string;
  fastsettingsdato: Date;
  gyldigFra: string;
  gyldigTil: string;
  fastsettingsmyndighet?: string;
  hjemmel?: string;
  internreferanserKartverket: Referanse[];
  leggTilInternreferanse?: string;
  rettskildeId?: string;
  rettskildeTittel: string;
};

type InputName = {
  leggTilDokumentlenke: string;
  leggTilInternreferanse: string;
};

type InputCollectionName = {
  dokumentlenker: string;
  internreferanserKartverket: string;
};

const OversiktReferanser = ({ feature }: { feature: Feature }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [displayMode, setDisplayMode] = useState(false);
  const [iconHovered, setIconHovered] = useState(false);
  const metadata = feature.getProperties()?.metadata as Metadata;
  const vedtaksinfoCollection = metadata.dokumentasjonsreferanser;
  const [selectedVedtaksinfoIndex, setSelectedVedtaksinfoIndex] = useState<
    number | undefined
  >(undefined);

  const closeModal = () => {
    setDisplayMode(false);
    setSelectedVedtaksinfoIndex(undefined);
    onClose();
  };

  return (
    <div>
      <Tooltip label={"tooltipLabel"} hasArrow placement="bottom">
        <OversiktHeader>
          <Text as="b">Dokumentreferanser</Text>
          <InfoIcon
            onMouseOver={() => setIconHovered(true)}
            onMouseOut={() => setIconHovered(false)}
          >
            <Icon
              size={24}
              color="var(--kvib-colors-blue-500)"
              isFilled={iconHovered}
              icon={"info"}
            ></Icon>
          </InfoIcon>
          <EditButton
            colorScheme="gray"
            aria-label="Legg til dokumentreferanse"
            onClick={() => {
              setDisplayMode(false);
              onOpen();
            }}
          >
            <p>Ny referanse</p>
            <Icon icon="add" />
          </EditButton>
        </OversiktHeader>
      </Tooltip>
      {vedtaksinfoCollection?.map((vedtak, index) => (
        <VedtaksinfoCard
          key={vedtak.id || vedtak.rettskildeTittel}
          title={vedtak.rettskildeTittel}
          date={vedtak.fastsettingsdato}
          onClick={() => {
            setDisplayMode(true);
            setSelectedVedtaksinfoIndex(index);
            onOpen();
          }}
        />
      ))}
      <VedtaksinfoDetaljer
        selectedVedtaksinfoIndex={selectedVedtaksinfoIndex}
        isOpen={isOpen}
        onClose={closeModal}
        feature={feature}
        displayMode={displayMode}
        setDisplayMode={setDisplayMode}
      />
    </div>
  );
};

const VedtaksinfoCard = ({
  title,
  onClick,
  date,
}: {
  title: string;
  date: string;
  onClick: () => void;
}) => {
  return (
    <VedtaksinfoContent>
      <Datofelt>{date}</Datofelt>
      <VedtaksinfoTitle>{title}</VedtaksinfoTitle>
      <Button
        onClick={onClick}
        rightIcon="folder_open"
        variant="secondary"
        colorScheme="gray"
        size="xs"
      >
        Åpne
      </Button>
    </VedtaksinfoContent>
  );
};

const Datofelt = styled.strong`
  margin-right: 20px;
`;

const VedtaksinfoContent = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between:;
  margin-top: 10px;
  width: 100%
`;

const VedtaksinfoTitle = styled.div`
  flex: 1;
`;

export const BorderTop = styled.div`
  border-top: 1px;
  border-color: var(--kvib-colors-gray-300);
  border-style: solid;
  margin: 10px;
`;

export const BorderBottom = styled.div`
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

export type { VedtakinfoForm, Referanse, InputName, InputCollectionName };
export { OversiktReferanser };
