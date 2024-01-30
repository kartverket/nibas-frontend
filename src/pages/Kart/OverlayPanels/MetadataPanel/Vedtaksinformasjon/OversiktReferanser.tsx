import { Button, Card, Icon, Text, Tooltip, useDisclosure } from "@kvib/react";
import { styled } from "styled-components";
import { InfoIcon } from "../MetadataGenerelt";
import { Feature } from "ol";
import { VedtaksinfoDetaljer } from "./VedtaksinfoDetaljer";
import { Dokref, Metadata } from "types/api";
import { useState } from "react";

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
// * Slett gammel kode

type Referanse = {
  beskrivelse: string;
  id?: string;
};

type VedtakinfoForm = {
  id?: string;
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

export type InputCollection = {
  dokumentlenker: string;
  internreferanserKartverket: string;
};

export type InputName = {
  leggTilDokumentlenke: string;
  leggTilInternreferanse: string;
};

const OversiktReferanser = ({ feature }: { feature: Feature }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [displayMode, setDisplayMode] = useState(false);
  const metadata = feature.getProperties()?.metadata as Metadata;
  const vedtaksinfoCollection = metadata.dokumentasjonsreferanser;
  const [iconHovered, setIconHovered] = useState(false);
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
          onClick={() => {
            setDisplayMode(false);
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
      />
    </div>
  );
};

const VedtaksinfoCard = ({
  title,
  onClick,
}: {
  title: string;
  onClick: () => void;
}) => {
  return <Card onClick={onClick}>{title}</Card>;
};
export const BorderTop = styled.div`
  border-top: 1px;
  border-color: var(--kvib-colors-gray-300);
  border-style: solid;
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

export type { VedtakinfoForm, Referanse };
export { OversiktReferanser };
