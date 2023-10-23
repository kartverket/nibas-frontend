import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import {
  Button,
  Datepicker,
  Divider,
  Input,
  Select,
  Text,
  Textarea,
} from "@kvib/react";
import { GrenseType } from "../../../../hooks/layers/types";
import { styled } from "styled-components";
import { MetadataField } from "./MetadataField";
import { getDateInFriendlyString } from "./utils";
import useNibasApi from "hooks/useNibasApi";
import { FeatureProperties, KodelisteRespons, Metadata } from "types/api";

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
  const gyldigTil = (properties.metadata as Metadata).common?.gyldigTil;

  const getMaalemetodeFromId = (maalemetoder: KodelisteRespons, id: string) =>
    maalemetoder.items.find((item) => item.id === id)?.label ?? null;

  return (
    <Container>
      <ID>
        <Text>UUID</Text>
        <Text as="b">{feature.getId()}</Text>
        <FakeEditButton colorScheme="gray" variant="secondary" isDisabled>
          Rediger
        </FakeEditButton>
      </ID>
      <Divider />
      <MetadataField
        feature={feature}
        fieldKey="grenseType"
        fieldLabel="Grensetype"
        valueLabelFormatter={() => {
          // Henter fra dataen i stedet for å formattere
          return properties.type;
        }}
        disabledByFeatureLock
        renderItem={(register) => (
          <Select {...register}>
            {GrenseTypeValues.map((grenseType: GrenseType) => (
              <option key={grenseType}>{grenseType}</option>
            ))}
          </Select>
        )}
      />
      <MetadataField
        feature={feature}
        fieldLabel="Datafangsdato"
        fieldKey="datafangstdato"
        valueLabelFormatter={getDateInFriendlyString}
        renderItem={(register) => <Datepicker {...register} />}
      />

      <MetadataField
        feature={feature}
        fieldLabel="Gyldig fra"
        fieldKey="gyldigFra"
        disabledByFeatureLock
        valueLabelFormatter={getDateInFriendlyString}
        renderItem={(register) => <Datepicker {...register} />}
      />
      {gyldigTil && (
        <MetadataField
          feature={feature}
          fieldLabel="Gyldig til"
          fieldKey="gyldigTil"
          disabledByFeatureLock
          valueLabelFormatter={getDateInFriendlyString}
          renderItem={(register) => <Datepicker {...register} />}
        />
      )}

      <MetadataField
        feature={feature}
        fieldLabel="Målemetode"
        fieldKey="maalemetode"
        valueLabelFormatter={(valueLabel) =>
          kodeliste ? getMaalemetodeFromId(kodeliste, valueLabel) : valueLabel
        }
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
        fieldKey="noeyaktighet"
        fieldLabel="Nøyaktighet (cm)"
        renderItem={(register) => <Input type="number" {...register} />}
      />

      <MetadataField
        feature={feature}
        fieldKey="opphav"
        fieldLabel="Opphav"
        renderItem={(register) => (
          <Input placeholder="Fyll inn informasjon om opphav" {...register} />
        )}
      />
      <MetadataField
        feature={feature}
        fieldKey="informasjon"
        fieldLabel="Ekstra informasjon"
        renderItem={(register) => (
          <Textarea placeholder="Fyll inn ekstra informasjon" {...register} />
        )}
      />
    </Container>
  );
};

const ID = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
`;

const FakeEditButton = styled(Button)`
  justify-self: end;
`;

export default MetadataGenerelt;
