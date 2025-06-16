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

type OldTeiggrenseMetadata = {
  BUE?: number | string | null;
  KOMMUNENR?: string | null;
  MALEMETODE?: number | string | null;
  NOYAKTIGHET?: number | string | null;
  NOYAKTIGHETSKLASSE?: number | string | null;
  OMTVISTET?: string | number | null;
  TEIGGRENSEID?: number | string | null;
  TEIGGRENSETYPE?: string | null;
  geometry?: unknown;
};

const teiggrenseMetadataValues = [
  "id",
  "kommunenr1",
  "kommunenr2",
  "hjelpelinjetypeId",
  "administrativgrensekodeId",
  "malemetodeId",
  "noyaktighet",
  "lagretNoyaktighetsklasse",
  "omtvistet",
] as const;

type TeiggrenseMetadata = {
  [K in (typeof teiggrenseMetadataValues)[number]]: number | string | null;
};
// 27.05.2025 Kan vel fjerne oldTeiggrensemetadata når vi en gang skroter innhenting via matrikkelWFS og kun bruker arbeidslisteAPI'et
// Sjekk om grensa er på gammelt format
const isOldTeiggrenseMetadata = (value: object): boolean => {
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
const mapOldToNewTeiggrenseMetadata = (oldObj: OldTeiggrenseMetadata): TeiggrenseMetadata => {
  let kommunenr1: string | null = null;
  let kommunenr2: string | null = null;
  let administrativgrensekodeId: number | null = null;

  if (typeof oldObj.KOMMUNENR === "string") {
    const parts = oldObj.KOMMUNENR.split(",").map((s) => s.trim());
    kommunenr1 = parts[0] ?? null;
    kommunenr2 = parts[1] ?? null;
    if (parts.length === 2) {
      administrativgrensekodeId = 1; // Hvis det er to kommuner, så er det kommunegrense (administrativ grensekode 1)
    }
  } else if (oldObj.KOMMUNENR != null) {
    kommunenr1 = oldObj.KOMMUNENR;
  }

  return {
    id: typeof oldObj.TEIGGRENSEID === "number" ? oldObj.TEIGGRENSEID : null,
    kommunenr1,
    kommunenr2,
    hjelpelinjetypeId: null,
    administrativgrensekodeId,
    malemetodeId: oldObj.MALEMETODE ?? null,
    noyaktighet: oldObj.NOYAKTIGHET ?? null,
    lagretNoyaktighetsklasse: oldObj.NOYAKTIGHETSKLASSE ?? null,
    omtvistet: oldObj.OMTVISTET === "1" ? 1 : 0,
  };
};

// Type guard for nytt format
const requiredKeys = teiggrenseMetadataValues.filter((k) => k !== "omtvistet");
export const isTeiggrenseMetadata = (value: object): value is TeiggrenseMetadata => {
  return requiredKeys.every((key) => key in value);
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
  let teiggrenseProperties: TeiggrenseMetadata | null = null;
  if (isTeiggrenseMetadata(featureProperties)) {
    teiggrenseProperties = {
      ...featureProperties,
      omtvistet: featureProperties.omtvistet ?? null,
    };
  } else if (isOldTeiggrenseMetadata(featureProperties)) {
    teiggrenseProperties = mapOldToNewTeiggrenseMetadata(featureProperties);
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
            <Text>
              {teiggrenseProperties.kommunenr1 != null && teiggrenseProperties.kommunenr2 != null ? (
                `${teiggrenseProperties.kommunenr1}, ${teiggrenseProperties.kommunenr2}`
              ) : teiggrenseProperties.kommunenr1 != null ? (
                teiggrenseProperties.kommunenr1
              ) : (
                <ItalicText>Ikke oppgitt</ItalicText>
              )}
            </Text>
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
            {teiggrenseProperties.omtvistet == null || teiggrenseProperties.omtvistet === 0 ? "Nei" : "Ja"}
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
