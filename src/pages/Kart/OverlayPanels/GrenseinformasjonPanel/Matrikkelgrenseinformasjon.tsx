import { Alert, AlertIcon, Text } from "@kvib/react";
import { Feature } from "ol";
import { LineString } from "ol/geom";
import { PropsWithChildren } from "react";
import { styled } from "styled-components";
import { PanelHeader } from "../Panel";
//import useNibasApi from "hooks/useNibasApi";

type TeiggrenseInformasjonProps = {
  feature: Feature<LineString>;
  onClose: () => void;
};

const GrensePanelContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-bottom: 24px;
`;

const ItalicText = styled(Text)`
  font-style: italic;
`;

const TeiggrenseProperty = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 8px;
`;

const teiggrenseMetadataValues = [
  "BUE",
  "KOMMUNENR",
  "MALEMETODE",
  "NOYAKTIGHET",
  "NOYAKTIGHETSKLASSE",
  "OMTVISTET",
  "TEIGGRENSEID",
  "TEIGGRENSETYPE",
  "geometry",
] as const;

type TeiggrenseMetadata = {
  [K in (typeof teiggrenseMetadataValues)[number]]: number | string | null;
};

const isTeiggrenseMetadata = (value: object): value is TeiggrenseMetadata => {
  return teiggrenseMetadataValues.every((key) => key in value);
};

type Props = {
  label: string;
} & PropsWithChildren;
const TeiggrensePropertyRow = ({ label, children }: Props) => {
  return (
    <TeiggrenseProperty>
      <Text as="b">{label}</Text>
      <Text>{children}</Text>
    </TeiggrenseProperty>
  );
};

const getNoyaktighetsklasseDescriptionFromKode = (kode: number) => {
  switch (kode) {
    case 0:
      return "Nøyaktige målinger Utvalg: S<= 10 cm. S er (antatt) standardavvik";
    case 1:
      return "Middels nøyaktige målinger og gamle nøyaktige målinger som er transformerte Utvalg: S>10 og S<=30 cm. S er (antatt) standardavvik";
    case 2:
      return "Mindre nøyaktige målinger og grenser hentet fra tekniske kart Utvalg: S>30 og S<200 cm. S er (antatt) standardavvik";
    case 3:
      return "Mindre nøyaktige grenser og grenser hentet fra kartserien Økonomisk kartverk (M: 5000) Utvalg: S>=200 og S<500 cm. S er (antatt) standardavvik";
    case 4:
      return "Lite nøyaktige grenser og grenser hentet fra kartserien Norge 1:50 000 Utvalg: S>= 500 cm og målemetode er ikke lik 80, 81 eller 82 (skisserte data). S er (antatt) standardavvik";
    case 5:
      return "Skisserte data. Utvalg: S>=500 og Målemetode =80, 81 eller 82 (skisserte data). S er (antatt) standardavvik.";
    default:
      return `Oppgitt nøyaktighetsklasse mangler nøyaktighet: ${kode}`;
  }
};

export const TeiggrenseInformasjon = ({ feature, onClose }: TeiggrenseInformasjonProps) => {
  const featureProperties = feature.getProperties();
  const teiggrenseProperties = isTeiggrenseMetadata(featureProperties) ? featureProperties : null;
  //const { data: kodeliste } = useNibasApi("/v1/kodeliste/maalemetode-koder");
  //const maalemetode = kodeliste?.items.find((item) => item.kode === teiggrenseProperties?.MALEMETODE?.toString());

  return (
    <GrensePanelContent>
      <PanelHeader noMargin onClose={onClose}>
        Informasjon
      </PanelHeader>
      {teiggrenseProperties ? (
        <>
          {/* <TeiggrensePropertyRow label={"Målemetode"}>
            {maalemetode != null ? (
              `${maalemetode.kode} ${maalemetode.label}`
            ) : (
              <ItalicText>Ikke oppgitt. Se nøyaktighetsklasse</ItalicText>
            )}
          </TeiggrensePropertyRow> */}
          <TeiggrensePropertyRow label={"Nøyaktighet (cm)"}>
            {teiggrenseProperties.NOYAKTIGHET != null ? (
              teiggrenseProperties.NOYAKTIGHET
            ) : (
              <ItalicText>Ikke oppgitt. Se nøyaktighetsklasse</ItalicText>
            )}
          </TeiggrensePropertyRow>
          <TeiggrensePropertyRow label={"Nøyaktighetsklasse"}>
            {getNoyaktighetsklasseDescriptionFromKode(
              typeof teiggrenseProperties.NOYAKTIGHETSKLASSE === "number"
                ? teiggrenseProperties.NOYAKTIGHETSKLASSE
                : -1,
            )}
          </TeiggrensePropertyRow>
          <TeiggrensePropertyRow label="Omtvistet">
            {teiggrenseProperties.OMTVISTET === 1 ? "Ja" : "Nei"}
          </TeiggrensePropertyRow>
        </>
      ) : (
        <Alert status="error">
          <AlertIcon />
          Finner ikke informasjon om valgt teiggrense. Kontakt Kartverket dersom du mener dette er feil.
        </Alert>
      )}
    </GrensePanelContent>
  );
};
