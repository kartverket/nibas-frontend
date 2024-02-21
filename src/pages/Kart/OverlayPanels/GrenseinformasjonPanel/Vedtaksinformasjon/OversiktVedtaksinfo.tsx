import { Button, Icon, Text, Tooltip, useDisclosure } from "@kvib/react";
import { styled } from "styled-components";
import { Feature } from "ol";
import { VedtaksinfoDetaljer } from "./VedtaksinfoDetaljer";
import { Metadata } from "types/api";
import { useState } from "react";

type Referanse = {
  beskrivelse: string;
  id?: string;
};

type VedtakinfoForm = {
  id?: string;
  dokumentlenker: Referanse[];
  leggTilDokumentlenke?: string;
  fastsettingsdato: Date;
  vedtakGyldigFra: Date | undefined;
  vedtakGyldigTil: Date | undefined;
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

export const OversiktVedtaksinfo = ({ feature }: { feature: Feature }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [displayMode, setDisplayMode] = useState(false);
  const [iconHovered, setIconHovered] = useState(false);
  const metadata = feature.getProperties()?.metadata as Metadata;
  const vedtaksinfoCollection = metadata.dokumentasjonsreferanser;
  const [selectedVedtaksinfoIndex, setSelectedVedtaksinfoIndex] = useState<number | undefined>(undefined);

  const closeModal = () => {
    setDisplayMode(false);
    setSelectedVedtaksinfoIndex(undefined);
    onClose();
  };

  return (
    <div>
      <OversiktHeader>
        <Tooltip label="Henvisning til dokumenter som er med å fastlegge aktuell grense." hasArrow placement="bottom">
          <InfoIcon onMouseOver={() => setIconHovered(true)} onMouseOut={() => setIconHovered(false)}>
            <Text as="b" paddingRight={"8px"}>
              Vedtaksinformasjon
            </Text>
            <Icon size={24} color="var(--kvib-colors-blue-500)" isFilled={iconHovered} icon={"info"}></Icon>
          </InfoIcon>
        </Tooltip>
        <Button
          size={"sm"}
          variant="secondary"
          rightIcon="add"
          colorScheme="blue"
          aria-label="Legg til dokumentreferanse"
          onClick={() => {
            setDisplayMode(false);
            onOpen();
          }}
        >
          Ny referanse
        </Button>
      </OversiktHeader>
      {vedtaksinfoCollection
        ?.filter((vedtak) => !vedtak.shouldArchive)
        .map((vedtak, index) => (
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

const VedtaksinfoCard = ({ title, onClick, date }: { title: string; date: string; onClick: () => void }) => {
  const formattedDate = new Date(date).toLocaleDateString("nb-NO");
  return (
    <VedtaksinfoContent>
      <Datofelt>{formattedDate}</Datofelt>
      <VedtaksinfoTitle>{title}</VedtaksinfoTitle>
      <Button onClick={onClick} rightIcon="folder_open" variant="secondary" colorScheme="blue" size="xs">
        Åpne
      </Button>
    </VedtaksinfoContent>
  );
};

const Datofelt = styled.div`
  margin-right: 20px;
`;

const VedtaksinfoContent = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 10px;
  margin-bottom: 15px;
  width: 100%
`;

const VedtaksinfoTitle = styled.div`
  flex: 1;
`;

export const BorderTop = styled.div`
  border-top: 1px;
  border-color: var(--kvib-colors-gray-300);
  border-style: solid;
  margin: 10px 0px 10px 0px;
`;

export const BorderBottom = styled.div`
  border-bottom: 1px;
  border-color: var(--kvib-colors-gray-300);
  border-style: solid;
`;

const OversiktHeader = styled.div`
  margin-left: 0px !important;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const InfoIcon = styled.div`
  display: flex;
  align-items: center;
  cursor: default;
`;

export type { VedtakinfoForm, Referanse, InputName, InputCollectionName };
