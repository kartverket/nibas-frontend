import { Alert, AlertIcon, Text } from "@kvib/react";
import { useKartlag } from "contexts/KartlagContext/KartlagContext";
import useNibasApi from "hooks/useNibasApi";
import { Feature } from "ol";
import { LineString } from "ol/geom";
import { PropsWithChildren } from "react";
import { styled } from "styled-components";
import { FeatureProperties, Metadata } from "types/api";
import { PanelHeader } from "../Panel";
import { datestringToFormattedDatestring } from "./grenseinformasjon-utils";
import { TitleWithIconTooltip } from "./TitleWithIconTooltip";

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
  tooltipLabel: string;
} & PropsWithChildren;
const SosiGrensePropertyRow = ({ label, children, tooltipLabel }: Props) => {
  return (
    <SosiGrenseProperty>
      <Row>
        <TitleWithIconTooltip tooltipLabel={tooltipLabel}>
          <TextWrapperLabel as="b">{label}</TextWrapperLabel>
        </TitleWithIconTooltip>
      </Row>
      <TextWrapper>{children}</TextWrapper>
    </SosiGrenseProperty>
  );
};

const Row = styled.div`
  display: flex;
  justify-content: space-between;
`;

type SosiGrenseProperties = FeatureProperties & {
  sosiFileOrigin: string;
  isVisible: boolean;
};
const isSosiGrenseProperties = (obj: object): obj is SosiGrenseProperties => {
  return "sosiFileOrigin" in obj && "isVisible" in obj;
};

export const SosiGrenseInformasjon = ({ onClose, feature }: SosiGrenseInformasjonProps) => {
  const { mappedLayers } = useKartlag();
  const sosiSublayers = mappedLayers.find((layer) => layer.id === "sosiFiler")?.sublayers;

  const featureProperties = feature.getProperties();
  const metadata = featureProperties.metadata as Metadata;

  const { data: kodeliste } = useNibasApi("/v1/kodeliste/maalemetode-koder");

  const getMaalemetodeText = (id: string | undefined) => {
    if (id === undefined || id.length === 0 || kodeliste === undefined) {
      return "Ikke spesifisert";
    }

    const maalemetode = kodeliste.items.find((item) => item.id === id);
    if (maalemetode) {
      return maalemetode?.kode + " " + maalemetode?.label;
    }

    return "Ukjent målemetode er registrert på grensen";
  };

  return (
    <GrensePanelContent>
      <PanelHeader noMargin onClose={onClose}>
        Informasjon
      </PanelHeader>
      {isSosiGrenseProperties(featureProperties) ? (
        <>
          <SosiGrensePropertyRow label={"Kilde"} tooltipLabel={"SOSI-fil som grensen er hentet fra"}>
            {featureProperties.sosiFileOrigin != null ? (
              `${sosiSublayers?.find((layer) => layer.id === featureProperties.sosiFileOrigin)?.title}`
            ) : (
              <ItalicText>Ikke oppgitt </ItalicText>
            )}
          </SosiGrensePropertyRow>
          <SosiGrensePropertyRow label={"Grensetype"} tooltipLabel={"Hvilken type grense som er valgt."}>
            {featureProperties.type != null ? (
              `${featureProperties.type.split(" ")[0] ?? featureProperties.type}`
            ) : (
              <ItalicText>Ikke oppgitt </ItalicText>
            )}
          </SosiGrensePropertyRow>
          <SosiGrensePropertyRow
            label={"Gyldig fra"}
            tooltipLabel={
              "Dato når grensen skal være gyldig fra. Fra-dato settes automatisk til publiseringsdato for utkastet ditt."
            }
          >
            {metadata.common?.gyldigFra != null ? (
              `${datestringToFormattedDatestring(metadata.common?.gyldigFra)}`
            ) : (
              <ItalicText>Ikke oppgitt </ItalicText>
            )}
          </SosiGrensePropertyRow>
          <SosiGrensePropertyRow
            label={"Datafangstdato"}
            tooltipLabel={"Dato når grensen siste gang ble registert, observert eller målt."}
          >
            {metadata.common?.datafangstdato != null ? (
              `${datestringToFormattedDatestring(metadata.common?.datafangstdato)}`
            ) : (
              <ItalicText>Ikke oppgitt </ItalicText>
            )}
          </SosiGrensePropertyRow>
          <SosiGrensePropertyRow
            label={"Målemetode"}
            tooltipLabel={"Metode som ligger til grunn for registrering av posisjon."}
          >
            {metadata.commonGrense?.posisjonskvalitet?.maalemetode?.id != null ? (
              `${getMaalemetodeText(metadata.commonGrense?.posisjonskvalitet?.maalemetode?.id)}`
            ) : (
              <ItalicText>Ikke oppgitt </ItalicText>
            )}
          </SosiGrensePropertyRow>
          <SosiGrensePropertyRow
            label={"Nøyaktighet (cm)"}
            tooltipLabel={
              "Antatt posisjonsnøyaktighet i grunnriss (x, y) oppgitt i cm. Den nøyaktigheten som angis bør være så nær det virkelige objektet som mulig."
            }
          >
            {metadata.commonGrense?.posisjonskvalitet?.noeyaktighet != null ? (
              `${metadata.commonGrense?.posisjonskvalitet?.noeyaktighet}`
            ) : (
              <ItalicText>Ikke oppgitt </ItalicText>
            )}
          </SosiGrensePropertyRow>
          <SosiGrensePropertyRow
            label={"Opphav"}
            tooltipLabel={"Ansvarlig organisasjon som er opphav til grensedataene."}
          >
            {metadata.common?.opphav != null ? `${metadata.common?.opphav}` : <ItalicText>Ikke oppgitt </ItalicText>}
          </SosiGrensePropertyRow>
          <SosiGrensePropertyRow
            label={"Ekstra informasjon"}
            tooltipLabel={"Åpent felt med ekstra informasjon om grensen"}
          >
            {metadata.common?.informasjon != null ? (
              `${metadata.common?.informasjon}`
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
