import { Alert, AlertIcon, Text } from "@kvib/react";
import { Feature } from "ol";
import { LineString } from "ol/geom";
import { PropsWithChildren } from "react";
import { styled } from "styled-components";
import { PanelHeader } from "../Panel";
import useNibasApi from "hooks/useNibasApi";
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

type TeiggrenseMetadataWFS = {
  BUE?: number | null;
  KOMMUNENR?: string | null;
  MALEMETODE?: number | null;
  NOYAKTIGHET?: number | null;
  NOYAKTIGHETSKLASSE?: number | null;
  OMTVISTET?: number | null;
  TEIGGRENSEID: number;
  TEIGGRENSETYPE?: number | null;
  geometry?: LineString | null;
};
export type TeiggrenseMetadata = {
  id: number;
  kommunenr1: string | null;
  kommunenr2: string | null;
  hjelpelinjetypeId: number | null;
  administrativgrensekodeId: number | null;
  malemetodeId: number | null;
  noyaktighet: number | null;
  lagretNoyaktighetsklasse: number | null;
  omtvistet: boolean | null;
};
// 27.05.2025 Kan vel fjerne TeiggrenseMetadataWFS når vi en gang skroter innhenting via matrikkelWFS og kun bruker arbeidslisteAPI'et
// Sjekk om grensa er på gammelt format
export const isTeiggrenseMetadataWFS = (value: object): value is TeiggrenseMetadataWFS => {
  const oldKeys = [
    "BUE",
    "KOMMUNENR",
    "MALEMETODE",
    "NOYAKTIGHET",
    "NOYAKTIGHETSKLASSE",
    "OMTVISTET",
    "TEIGGRENSEID",
    "TEIGGRENSETYPE",
    "geometry",
  ];
  return oldKeys.every((key) => key in value);
};

// Mapper fra gammelt til nytt format
export const mapWFSToNewTeiggrenseMetadata = (oldObj: TeiggrenseMetadataWFS): TeiggrenseMetadata => {
  let kommunenr1: string | null = null;
  let kommunenr2: string | null = null;
  if (typeof oldObj.KOMMUNENR === "string") {
    const parts = oldObj.KOMMUNENR.split(",").map((s) => s.trim());
    kommunenr1 = parts[0] ?? null;
    kommunenr2 = parts[1] ?? null;
  } else if (oldObj.KOMMUNENR != null) {
    kommunenr1 = oldObj.KOMMUNENR;
  }

  return {
    id: oldObj.TEIGGRENSEID,
    kommunenr1,
    kommunenr2,
    hjelpelinjetypeId: oldObj.TEIGGRENSETYPE ?? null,
    administrativgrensekodeId: null,
    malemetodeId: oldObj.MALEMETODE ?? null,
    noyaktighet: oldObj.NOYAKTIGHET ?? null,
    lagretNoyaktighetsklasse: oldObj.NOYAKTIGHETSKLASSE ?? null,
    omtvistet: oldObj.OMTVISTET == null ? null : oldObj.OMTVISTET === 1 ? true : false,
  };
};

const requiredKeys = [
  "id",
  "kommunenr1",
  "kommunenr2",
  "hjelpelinjetypeId",
  "administrativgrensekodeId",
  "malemetodeId",
  "noyaktighet",
  "lagretNoyaktighetsklasse",
] as const;
// Type guard for nytt format
export const isTeiggrenseMetadata = (value: object): value is TeiggrenseMetadata => {
  return requiredKeys.every((key) => key in value);
};
type Props = {
  label: string;
} & PropsWithChildren;
const TeiggrensePropertyRow = ({ label, children }: Props) => {
  return (
    <TeiggrenseProperty>
      <TextWrapperLabel as="b">{label}</TextWrapperLabel>
      <TextWrapper>{children}</TextWrapper>
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
  let teiggrenseProperties: TeiggrenseMetadata | null = null;
  if (isTeiggrenseMetadata(featureProperties)) {
    teiggrenseProperties = featureProperties as TeiggrenseMetadata;
  } else if (isTeiggrenseMetadataWFS(featureProperties)) {
    teiggrenseProperties = mapWFSToNewTeiggrenseMetadata(featureProperties);
  }
  const { data: matrikkelkodeliste } = useNibasApi("/v1/matrikkelkodelister");
  const maalemetode = matrikkelkodeliste?.maalemetodeKodeliste.find(
    (item) => item.id.toString() === teiggrenseProperties?.malemetodeId?.toString(),
  );
  const administrativGrenseType = matrikkelkodeliste?.administrativGrenseKodeliste.find(
    (item) => item.id.toString() === teiggrenseProperties?.administrativgrensekodeId?.toString(),
  );
  const hjelpelinjetype = matrikkelkodeliste?.hjelpelinjetypeKodeliste.find(
    (item) => item.id.toString() === teiggrenseProperties?.hjelpelinjetypeId?.toString(),
  );
  return (
    <GrensePanelContent>
      <PanelHeader noMargin onClose={onClose}>
        Informasjon
      </PanelHeader>
      {teiggrenseProperties ? (
        <>
          <TeiggrensePropertyRow label={"Identifikator (ID)"}>
            {teiggrenseProperties.id != null ? `${teiggrenseProperties.id}` : <ItalicText>Ikke oppgitt </ItalicText>}
          </TeiggrensePropertyRow>
          <TeiggrensePropertyRow label={"Grensetype"}>
            {administrativGrenseType != null ? (
              `${administrativGrenseType.navn}`
            ) : (
              <ItalicText>Ikke oppgitt </ItalicText>
            )}
          </TeiggrensePropertyRow>
          <TeiggrensePropertyRow label={teiggrenseProperties.kommunenr2 != null ? "Kommuner" : "Kommune"}>
            <TextWrapper>
              {teiggrenseProperties.kommunenr1 != null && teiggrenseProperties.kommunenr2 != null ? (
                `${teiggrenseProperties.kommunenr1}, ${teiggrenseProperties.kommunenr2}`
              ) : teiggrenseProperties.kommunenr1 != null ? (
                teiggrenseProperties.kommunenr1
              ) : (
                <ItalicText>Ikke oppgitt</ItalicText>
              )}
            </TextWrapper>
          </TeiggrensePropertyRow>
          <TeiggrensePropertyRow label={"Målemetode"}>
            {maalemetode != null ? `${maalemetode.navn}` : <ItalicText>Ikke oppgitt. Se nøyaktighetsklasse</ItalicText>}
          </TeiggrensePropertyRow>
          <TeiggrensePropertyRow label={"Nøyaktighet (cm)"}>
            {teiggrenseProperties.noyaktighet != null ? (
              teiggrenseProperties.noyaktighet
            ) : (
              <ItalicText>Ikke oppgitt. Se nøyaktighetsklasse</ItalicText>
            )}
          </TeiggrensePropertyRow>
          <TeiggrensePropertyRow label={"Nøyaktighetsklasse"}>
            {getNoyaktighetsklasseDescriptionFromKode(
              typeof teiggrenseProperties.lagretNoyaktighetsklasse === "number"
                ? teiggrenseProperties.lagretNoyaktighetsklasse
                : -1,
            )}
          </TeiggrensePropertyRow>
          <TeiggrensePropertyRow label="Omtvistet">
            {teiggrenseProperties.omtvistet === true ? "Ja" : "Nei"}
          </TeiggrensePropertyRow>
          <TeiggrensePropertyRow label={"Hjelpelinjetype"}>
            {hjelpelinjetype != null ? `${hjelpelinjetype.navn}` : <ItalicText>Ikke oppgitt </ItalicText>}
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
const TextWrapperLabel = styled.div`
  font-weight: 1000;
`;
const TextWrapper = styled.div`
  font-weight: 600;
`;
