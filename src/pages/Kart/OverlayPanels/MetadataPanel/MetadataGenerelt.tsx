import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import { Alert, AlertIcon, Datepicker, Input, Select, Textarea } from "@kvib/react";
import { GrenseType } from "../../../../hooks/layers/types";
import { styled } from "styled-components";
import { MetadataField } from "./MetadataField";
import { getDateInFriendlyString } from "./utils";
import useNibasApi from "hooks/useNibasApi";
import { FeatureProperties, KodelisteRespons, Metadata } from "types/api";
import { TilhorighetField } from "./TilhorighetField";
import { isTempFeatureId } from "pages/Kart/interactions/tempFeatureIdUtil";
import { OversiktReferanser } from "./Vedtaksinformasjon/OversiktReferanser";

export type Inputs = {
  uuid: string;
  grenseType: string;
  maalemetode: string;
  datafangstdato: string;
  noeyaktighet: number;
  informasjon: string;
  opphav: string;
  gyldigFra: string;
  gyldigTil: string;
  tilhorighet: string[];
};

const GrenseTypeValues: GrenseType[] = [
  "Kommunegrense",
  "Fylkesgrense",
  "Riksgrense",
  "AvtaltAvgrensningslinje",
  "Territorialgrense",
  "Grunnkretsgrense",
  "Delområdegrense",
  "Posisjon",
  "Stemmekretsgrense",
];

type Props = {
  feature: Feature<Geometry>;
};

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const MetadataGenerelt = ({ feature }: Props) => {
  const properties = feature.getProperties() as FeatureProperties;
  const { data: kodeliste } = useNibasApi("/v1/kodeliste/maalemetode-koder");

  const metadata = properties.metadata as Metadata;

  const gyldigTil = properties.metadata ? metadata.common?.gyldigTil : undefined;

  const getMaalemetodeFromId = (maalemetoder: KodelisteRespons, id: string) =>
    maalemetoder.items.find((item) => item.id === id)?.label ?? null;

  const grenseType = properties.type as GrenseType;

  const tilhorighetToChange =
    grenseType === "Grunnkretsgrense" || grenseType === "Delområdegrense"
      ? "grunnkretser"
      : grenseType === "Stemmekretsgrense"
        ? "stemmekretser"
        : null;

  return (
    <Container>
      <MetadataField
        feature={feature}
        tooltipLabel="Hvilken type grense som er valgt."
        fieldKey="grenseType"
        fieldLabel="Grensetype"
        valueLabelFormatter={() => {
          // Henter fra dataen i stedet for å formattere
          return properties.type;
        }}
        isDisabled
        isUneditable
        renderItem={(register) => (
          <Select {...register}>
            {GrenseTypeValues.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </Select>
        )}
      />
      <MetadataField
        feature={feature}
        tooltipLabel="Grensen sin unike identifikator"
        fieldKey="uuid"
        fieldLabel="Identifikator (UUID)"
        valueLabelFormatter={() => {
          const featureId = feature.getId()?.toString();

          if (featureId && isTempFeatureId(featureId))
            return `Ny grense - ID blir satt ved publisering - Midlertidig ID: ${featureId}`;

          return feature.getId()?.toString() || null;
        }}
        isDisabled
        isUneditable
        renderItem={(register) => <Input placeholder={feature.getId()?.toString()} {...register} />}
      />

      <MetadataField
        feature={feature}
        tooltipLabel="Dato når grensen skal være gyldig fra. Fra-dato settes automatisk til publiseringsdato for utkastet ditt."
        fieldLabel="Gyldig fra"
        fieldKey="gyldigFra"
        isDisabled
        isUneditable
        valueLabelFormatter={(date) => {
          const formattedDate = getDateInFriendlyString(date);
          const featureId = feature.getId()?.toString();

          if (featureId && isTempFeatureId(featureId)) return "Ny grense - Dato blir satt ved publisering";

          return formattedDate || null;
        }}
        renderItem={(register) => <Datepicker {...register} />}
      />

      <MetadataField
        feature={feature}
        tooltipLabel="Dato når grensen siste gang ble registert, observert eller målt. Oppdateres automatisk ved lagring av ny metadata for grense."
        fieldLabel="Datafangsdato"
        fieldKey="datafangstdato"
        isUneditable
        valueLabelFormatter={(date) => {
          const formattedDate = getDateInFriendlyString(date);
          const featureId = feature.getId()?.toString();

          if (featureId && isTempFeatureId(featureId)) return "Ny grense - Dato blir satt ved publisering";

          return formattedDate || null;
        }}
        renderItem={(register) => <Datepicker {...register} />}
      />

      {gyldigTil && (
        <div>
          <MetadataField
            feature={feature}
            tooltipLabel="Dato når grensen skal være gyldig til."
            fieldLabel="Gyldig til"
            fieldKey="gyldigTil"
            isDisabled
            valueLabelFormatter={getDateInFriendlyString}
            renderItem={(register) => <Datepicker {...register} />}
          />
          <Alert status="warning" variant="top-accent">
            <AlertIcon />
            Grensen er satt til å utgå ved en fremtidig dato, og du vil derfor ikke kunne gjøre noen endringer på denne
            grensen.
          </Alert>
        </div>
      )}

      <MetadataField
        feature={feature}
        tooltipLabel="Metode som ligger til grunn for registrering av posisjon."
        fieldLabel="Målemetode"
        fieldKey="maalemetode"
        valueLabelFormatter={(valueLabel) => (kodeliste ? getMaalemetodeFromId(kodeliste, valueLabel) : valueLabel)}
        renderItem={(register) =>
          kodeliste && (
            <Select {...register}>
              <option value="">Velg målemetode</option>
              {kodeliste.items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </Select>
          )
        }
      />
      <MetadataField
        feature={feature}
        tooltipLabel="Antatt posisjonsnøyaktighet i grunnriss (x, y) oppgitt i cm. Den nøyaktigheten som angis bør være så nær det virkelige objektet som mulig."
        fieldKey="noeyaktighet"
        fieldLabel="Nøyaktighet (cm)"
        renderItem={(register) => <Input type="number" {...register} />}
      />

      <MetadataField
        feature={feature}
        tooltipLabel="Ansvarlig organisasjon som er opphav til grensedataene."
        fieldKey="opphav"
        fieldLabel="Opphav"
        renderItem={(register) => <Input placeholder="Fyll inn informasjon om opphav" {...register} />}
      />
      <MetadataField
        feature={feature}
        tooltipLabel="Åpent felt med ekstra informasjon om grensen"
        fieldKey="informasjon"
        fieldLabel="Ekstra informasjon"
        renderItem={(register) => <Textarea placeholder="Fyll inn ekstra informasjon" {...register} />}
      />
      {tilhorighetToChange && <TilhorighetField feature={feature} tilhorighetToChange={tilhorighetToChange} />}
      <OversiktReferanser feature={feature} />
    </Container>
  );
};

export default MetadataGenerelt;
