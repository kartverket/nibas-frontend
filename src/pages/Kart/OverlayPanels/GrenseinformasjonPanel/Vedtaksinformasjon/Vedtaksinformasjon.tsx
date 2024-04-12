import { Button, Icon, Text, Tooltip, useDisclosure } from "@kvib/react";
import { styled } from "styled-components";
import { Feature } from "ol";
import { VedtaksinfoDetaljer } from "./VedtaksinfoDetaljer";
import { FeatureProperties, Metadata } from "types/api";
import { useState } from "react";
import useIsGrenseinformasjonPanelDisabled from "../../hooks/useIsGrenseInformasjonPanelDisabled";
import { isAdministrativGrense } from "utils/grenser";
import { isGrenseType } from "utils/type-utils";

export type Referanse = {
  beskrivelse: string;
  id?: string;
};

export type VedtakinfoForm = {
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

export type InputName = {
  leggTilDokumentlenke: string;
  leggTilInternreferanse: string;
};

export type FormViewState = "editing" | "viewing" | "creating";

export const Vedtaksinformasjon = ({ feature }: { feature: Feature }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [formViewState, setFormViewState] = useState<FormViewState>("creating");
  const [iconHovered, setIconHovered] = useState(false);
  const [selectedVedtaksinfoId, setSelectedVedtaksinfoId] = useState<string | undefined>(undefined);
  const properties = feature.getProperties() as FeatureProperties;
  const metadata = properties.metadata as Metadata | undefined;
  const vedtaksinfoCollection = metadata?.dokumentasjonsreferanser;

  const isGrenseinfoPanelDisabled = useIsGrenseinformasjonPanelDisabled(feature);

  const closeModal = () => {
    setFormViewState("creating");
    setSelectedVedtaksinfoId(undefined);
    onClose();
  };

  if (!metadata || !(isGrenseType(properties.type) && isAdministrativGrense(properties.type))) return;

  return (
    <>
      <OversiktHeader>
        <Tooltip label="Henvisning til dokumenter som er med å fastlegge aktuell grense." hasArrow placement="bottom">
          <InfoIcon onMouseOver={() => setIconHovered(true)} onMouseOut={() => setIconHovered(false)}>
            <Text as="b" paddingRight="8px">
              Vedtaksinformasjon
            </Text>
            <Icon size={24} color="var(--kvib-colors-blue-500)" isFilled={iconHovered} icon="info"></Icon>
          </InfoIcon>
        </Tooltip>
        <Button
          size="sm"
          variant="secondary"
          rightIcon="add"
          isDisabled={isGrenseinfoPanelDisabled}
          aria-label="Legg til dokumentreferanse"
          onClick={() => {
            setFormViewState("creating");
            onOpen();
          }}
        >
          Ny referanse
        </Button>
      </OversiktHeader>
      {vedtaksinfoCollection
        ?.filter((vedtak) => !vedtak.shouldArchive)
        .map((vedtak) => (
          <VedtaksinfoCard
            key={vedtak.id}
            title={vedtak.rettskildeTittel}
            date={vedtak.fastsettingsdato}
            onClick={() => {
              setFormViewState("viewing");
              setSelectedVedtaksinfoId(vedtak.id);
              onOpen();
            }}
          />
        ))}
      <VedtaksinfoDetaljer
        setFormViewState={setFormViewState}
        formViewState={formViewState}
        selectedVedtaksinfoId={selectedVedtaksinfoId}
        isOpen={isOpen}
        onClose={closeModal}
        feature={feature}
        isDisabled={isGrenseinfoPanelDisabled}
      />
    </>
  );
};

const VedtaksinfoCard = ({ title, onClick, date }: { title: string; date: string; onClick: () => void }) => {
  const formattedDate = new Date(date).toLocaleDateString("nb-NO");
  return (
    <VedtaksinfoContent>
      <Datofelt>{formattedDate}</Datofelt>
      <VedtaksinfoTitle>{title}</VedtaksinfoTitle>
      <Button onClick={onClick} rightIcon="folder_open" variant="secondary" size="xs">
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
  width: 100%;
`;

const VedtaksinfoTitle = styled.div`
  flex: 1;
  overflow: hidden;
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
