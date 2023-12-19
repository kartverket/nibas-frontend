import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import {
  Alert,
  AlertIcon,
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

export const Container = styled.div`
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
      <Container>
        <ID>
          <Text>UUID</Text>
          <Text as="b">{feature.getId()}</Text>
          <FakeEditButton colorScheme="gray" variant="secondary" isDisabled>
            Rediger
          </FakeEditButton>
        </ID>
        <Divider />
      </Container>
      <MetadataField
        feature={feature}
        tooltipLabel="Hva slags grense/kartobjekt det valgte objektet er"
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
        tooltipLabel="Dato når grensen sist ble registrert/observert/målt i terreng"
        fieldLabel="Datafangsdato"
        fieldKey="datafangstdato"
        valueLabelFormatter={getDateInFriendlyString}
        renderItem={(register) => <Datepicker {...register} />}
      />

      <MetadataField
        feature={feature}
        tooltipLabel="Tidspunktet når grensen oppstod i den virkelige verden"
        fieldLabel="Gyldig fra"
        fieldKey="gyldigFra"
        disabledByFeatureLock
        valueLabelFormatter={getDateInFriendlyString}
        renderItem={(register) => <Datepicker {...register} />}
      />
      {gyldigTil && (
        <div>
          <MetadataField
            feature={feature}
            tooltipLabel="Tidspunktet når objektet opphørte å eksistere i den virkelige verden"
            fieldLabel="Gyldig til"
            fieldKey="gyldigTil"
            disabledByFeatureLock
            valueLabelFormatter={getDateInFriendlyString}
            renderItem={(register) => <Datepicker {...register} />}
          />
          <Alert status="warning" variant="top-accent">
            <AlertIcon />
            Grensen er satt til å utgå ved en fremtidig dato, og du vil derfor
            ikke kunne gjøre noen endringer på denne grensen.
          </Alert>
        </div>
      )}

      <MetadataField
        feature={feature}
        tooltipLabel="Metode for måling i grunnriss (x, y)"
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
        tooltipLabel="Punktstandardavviket i grunnriss for punkter, samt tverravvik for linjer. Målt i centimeter"
        fieldKey="noeyaktighet"
        fieldLabel="Nøyaktighet (cm)"
        renderItem={(register) => <Input type="number" {...register} />}
      />

      <MetadataField
        feature={feature}
        tooltipLabel="Referanse til opphavsmaterialet, kildematerialet, organisasjons/publiseringskilde. Merk at dette også kan beskrive navn på person og årsak til oppdatering"
        fieldKey="opphav"
        fieldLabel="Opphav"
        renderItem={(register) => (
          <Input placeholder="Fyll inn informasjon om opphav" {...register} />
        )}
      />
      <MetadataField
        feature={feature}
        tooltipLabel="Generell ekstra opplysning dersom dette behøves"
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
`;

const FakeEditButton = styled(Button)`
  justify-self: end;
`;

export default MetadataGenerelt;
