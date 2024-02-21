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
  const [selectedVedtaksinfoIndex, setSelectedVedtaksinfoIndex] = useState<number | undefined>(undefined);
  const metadata = feature.getProperties()?.metadata as Metadata | undefined;
  const vedtaksinfoCollection = metadata?.dokumentasjonsreferanser;

  const closeModal = () => {
    setDisplayMode(false);
    setSelectedVedtaksinfoIndex(undefined);
    onClose();
  };

  if (!metadata) return;

  return (
    <Container>
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
    </Container>
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

const Container = styled.div`
  padding-bottom: 32px;
`;

const Datofelt = styled.div`
  margin-right: 20px;
`;

const VedtaksinfoContent = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 10px;
  margin-bottom: 15px;
  width: 100%;
`;

const VedtaksinfoTitle = styled.div`
  flex: 1;
`;

const OversiktHeader = styled.div`
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
