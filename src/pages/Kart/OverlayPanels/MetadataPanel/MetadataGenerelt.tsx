import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import {
  Datepicker,
  Input,
  Select,
  Textarea,
  useDisclosure,
} from "@kvib/react";
import { GrenseType } from "../../../../hooks/layers/types";
import { styled } from "styled-components";
import { MetadataField } from "./MetadataField";
import { getDateInFriendlyString } from "./utils";
import useNibasApi from "hooks/useNibasApi";
import { FeatureProperties, KodelisteRespons } from "types/api";
import { FlateOpprettelseModal } from "./FlateOpprettelseModal";
import { getNavnInSpraak } from "utils/language/language";
import { useTilhorighet } from "../hooks/useTilhorighet";
import { getIdFromEntity } from "utils/api";
import { Flatedata } from "contexts/OverlayPanelContext";

export type Inputs = {
  grenseType: string;
  maalemetode: string;
  datafangstdato: string;
  noeyaktighet: number;
  informasjon: string;
  opphav: string;
  gyldigFra: string;
  gyldigTil: string;
  tilhorighet: [string, string];
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
  flatedata: Flatedata;
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const DefaultOption = styled.option`
  font-style: italic;
`;

const MetadataGenerelt = ({ feature, flatedata }: Props) => {
  const properties = feature.getProperties() as FeatureProperties;
  const kommuneId = flatedata ? getIdFromEntity(flatedata) : "";
  const { data: kodeliste } = useNibasApi("/v1/kodeliste/maalemetode-koder");

  const tilhorighetOptions = useTilhorighet(
    properties.type as GrenseType,
    kommuneId,
  );

  const {
    isOpen: isOpprettelseOpen,
    onClose: onOpprettelseClose,
    onOpen: onOpprettelseOpen,
  } = useDisclosure();

  const getMaalemetodeFromId = (maalemetoder: KodelisteRespons, id: string) =>
    maalemetoder.items.find((item) => item.id === id)?.label ?? null;

  const handleSelect = (option: string) => {
    if (option == "OPPRETT") {
      onOpprettelseOpen();
    }
  };

  return (
    <Container>
      <MetadataField
        feature={feature}
        fieldKey="grenseType"
        fieldLabel="Grensetype"
        valueLabelFormatter={() => {
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
        valueLabelFormatter={(valueLabel) =>
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
        fieldKey="noeyaktighet"
        fieldLabel="Nøyaktighet (cm)"
      >
        <Input type="number" />
      </MetadataField>
      <MetadataField feature={feature} fieldKey="opphav" fieldLabel="Opphav">
        <Input placeholder="Fyll inn informasjon om opphav" />
      </MetadataField>
      <MetadataField
        feature={feature}
        fieldKey="informasjon"
        fieldLabel="Ekstra informasjon"
      >
        <Textarea placeholder="Fyll inn ekstra informasjon" />
      </MetadataField>
      <MetadataField
        feature={feature}
        fieldKey={"tilhorighet"}
        fieldLabel={"Tilhørighet"}
      >
        <Container>
          {["1", "2"].map((key) => (
            <Select key={key} onChange={(e) => handleSelect(e.target.value)}>
              <DefaultOption value={`DEFAULT`}>
                Velg en flate fra listen
              </DefaultOption>

              {tilhorighetOptions &&
                tilhorighetOptions.map((krets) => {
                  const uid = `${key}_${krets.id.lokalid.value}`;
                  return (
                    <option key={uid} value={uid}>
                      {krets.kretsNummer} {getNavnInSpraak(krets.navn, "nor")}
                    </option>
                  );
                })}
            </Select>
          ))}
        </Container>
      </MetadataField>
      <FlateOpprettelseModal
        isOpen={isOpprettelseOpen}
        featureProps={properties}
        onClose={onOpprettelseClose}
      />
    </Container>
  );
};

export default MetadataGenerelt;
