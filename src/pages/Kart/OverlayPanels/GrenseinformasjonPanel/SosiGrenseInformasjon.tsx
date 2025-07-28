import { Alert, AlertIcon, Text } from "@kvib/react";
import { styled } from "styled-components";
import { PanelHeader } from "../Panel";
import { Feature } from "ol";
import { LineString } from "ol/geom";
import { PropsWithChildren } from "react";
import { FeatureProperties } from "types/api";

type SosiGrenseInformasjonProps = {
  feature: Feature<LineString>;
  onClose: () => void;
};

const GrensePanelContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-bottom: 24px;
`;

type Props = {
  label: string;
} & PropsWithChildren;
const SosiGrensePropertyRow = ({ label, children }: Props) => {
  return (
    <SosiGrenseProperty>
      <TextWrapperLabel as="b">{label}</TextWrapperLabel>
      <TextWrapper>{children}</TextWrapper>
    </SosiGrenseProperty>
  );
};

type SosiGrenseProperties = FeatureProperties & {
  sosiFileOrigin: string;
  isVisible: boolean;
};
const isSosiGrenseProperties = (obj: object): obj is SosiGrenseProperties => {
  return "sosiFileOrigin" in obj && "isVisible" in obj;
};

export const SosiGrenseInformasjon = ({ onClose, feature }: SosiGrenseInformasjonProps) => {
  const featureProperties = feature.getProperties();
  return (
    <GrensePanelContent>
      <PanelHeader noMargin onClose={onClose}>
        Informasjon
      </PanelHeader>
      {isSosiGrenseProperties(featureProperties) ? (
        <>
          <SosiGrensePropertyRow label={"Grensetype"}>
            {featureProperties.type != null ? (
              `${featureProperties.type.split("-")[1] ?? featureProperties.type}`
            ) : (
              <ItalicText>Ikke oppgitt </ItalicText>
            )}
          </SosiGrensePropertyRow>
        </>
      ) : (
        <Alert status="info">
          <AlertIcon />
          Det mangler informasjon om denne grensen. Hvis du mener dette er en feil, vennligst kontakt Kartverket.
        </Alert>
      )}
    </GrensePanelContent>
  );
};

const ItalicText = styled(Text)`
  font-style: italic;
`;

const SosiGrenseProperty = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 8px;
`;

const TextWrapperLabel = styled.div`
  font-weight: 1000;
`;
const TextWrapper = styled.div`
  font-weight: 600;
`;
