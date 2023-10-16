import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import { Datepicker, Input, Select, Textarea } from "@kvib/react";
import { GrenseType } from "../../../../hooks/layers/types";
import { styled } from "styled-components";
import { MetadataField } from "./MetadataField";
import { getDateInFriendlyString } from "./utils";
import useNibasApi from "hooks/useNibasApi";
import { FeatureProperties, KodelisteRespons } from "types/api";

export type Inputs = {
  grenseType: string;
  maalemetode: string;
  datafangstdato: string;
  noeyaktighet: number;
  informasjon: string;
  opphav: string;
  gyldigFra: string;
  gyldigTil: string;
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

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const MetadataGenerelt = ({ feature }: Props) => {
  const { data: kodeliste } = useNibasApi("/v1/kodeliste/maalemetode-koder");
  const properties = feature.getProperties() as FeatureProperties;

  const getMaalemetodeFromId = (maalemetoder: KodelisteRespons, id: string) =>
    maalemetoder.items.find((item) => item.id === id)?.label ?? null;

  return (
    <Container>
      <MetadataField
        feature={feature}
        fieldKey="grenseType"
        fieldLabel="Grensetype"
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        valueLabelFormatter={(_) => {
          // Henter fra dataen i stedet for å formattere
          return properties.type;
        }}
        disabledByFeatureLock
      >
        <Select>
          {GrenseTypeValues.map((grenseType: GrenseType) => (
            <option key={grenseType}>{grenseType}</option>
          ))}
        </Select>
      </MetadataField>
      <MetadataField
        feature={feature}
        fieldLabel="Datafangsdato"
        fieldKey="datafangstdato"
        valueLabelFormatter={getDateInFriendlyString}
      >
        <Datepicker />
      </MetadataField>
      <MetadataField
        feature={feature}
        fieldLabel="Gyldig fra"
        fieldKey="gyldigFra"
        disabledByFeatureLock
        valueLabelFormatter={getDateInFriendlyString}
      >
        <Datepicker />
      </MetadataField>
      <MetadataField
        feature={feature}
        fieldLabel="Gyldig til"
        fieldKey="gyldigTil"
        disabledByFeatureLock
        valueLabelFormatter={getDateInFriendlyString}
      >
        <Datepicker />
      </MetadataField>
      <MetadataField
        feature={feature}
        fieldLabel="Målemetode"
        fieldKey="maalemetode"
        valueLabelFormatter={(valueLabel: string) =>
          kodeliste ? getMaalemetodeFromId(kodeliste, valueLabel) : valueLabel
        }
      >
        <Select>
          <option value="">Velg målemetode</option>
          {kodeliste &&
            kodeliste.items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
        </Select>
      </MetadataField>
      <MetadataField
        feature={feature}
        fieldKey={"noeyaktighet"}
        fieldLabel={"Nøyaktighet (cm)"}
      >
        <Input type="number" />
      </MetadataField>
      <MetadataField feature={feature} fieldKey="opphav" fieldLabel="Opphav">
        <Input placeholder={"Fyll inn informasjon om opphav"} />
      </MetadataField>
      <MetadataField
        feature={feature}
        fieldKey="informasjon"
        fieldLabel="Ekstra informasjon"
      >
        <Textarea placeholder={"Fyll inn ekstra informasjon"} />
      </MetadataField>
    </Container>
  );
};

export default MetadataGenerelt;
