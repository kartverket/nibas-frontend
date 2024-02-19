import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import { Alert, AlertIcon, Datepicker, Input, Select, Textarea } from "@kvib/react";
import { GrenseType } from "hooks/layers/types";
import { styled } from "styled-components";
import { GrenseinformasjonField } from "./GrenseinformasjonField";
import { getDateInFriendlyString } from "./utils";
import useNibasApi from "hooks/useNibasApi";
import { FeatureProperties, KodelisteRespons, Metadata } from "types/api";
import { isTempFeatureId } from "pages/Kart/interactions/tempFeatureIdUtil";
import { EditingType, useEditAllGrenser } from "contexts/EditGrenserContext";
import { TilhorighetField } from "./TilhorighetField";
import { OversiktVedtaksinfo } from "./Vedtaksinformasjon/OversiktVedtaksinfo";

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

type Props = {
  feature: Feature<Geometry>;
};

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const GrenseinformasjonFieldList = ({ feature }: Props) => {
  const properties = feature.getProperties() as FeatureProperties;
  const { data: kodeliste } = useNibasApi("/v1/kodeliste/maalemetode-koder");
  const { getCurrentlyEditingType } = useEditAllGrenser();

  const metadata = properties.metadata as Metadata;

  const gyldigTil = properties.metadata ? metadata.common?.gyldigTil : undefined;

  const getMaalemetodeFromId = (maalemetoder: KodelisteRespons, id: string) =>
    maalemetoder.items.find((item) => item.id === id)?.label ?? null;

  const getPossibleGrenseTypesFromEditingType = (editingType: EditingType | null): GrenseType[] => {
    if (editingType === "stemmekrets") {
      return ["Stemmekretsgrense", "Kommunegrense"];
    }
    if (editingType === "grunnkrets") {
      return ["Grunnkretsgrense", "Delområdegrense", "Kommunegrense"];
    }

    return [];
  };

  return (
    <Container>
      <GrenseinformasjonField
        feature={feature}
        tooltipLabel="Hvilken type grense som er valgt."
        fieldKey="grenseType"
        fieldLabel="Grensetype"
        renderItem={(register) => (
          <Select {...register}>
            {getPossibleGrenseTypesFromEditingType(getCurrentlyEditingType()).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        )}
      />
      <GrenseinformasjonField
        feature={feature}
        tooltipLabel="Grensen sin unike identifikator"
        fieldKey="uuid"
        fieldLabel="Identifikator (UUID)"
        valueLabelFormatter={() => {
          const featureId = feature.getId()?.toString();

          if (featureId && isTempFeatureId(featureId)) return `Ny grense - ID blir satt ved publisering`;

          return feature.getId()?.toString() || null;
        }}
        isDisabled
        isUneditable
        renderItem={(register) => <Input placeholder={feature.getId()?.toString()} {...register} />}
      />

      <GrenseinformasjonField
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

      <TilhorighetField feature={feature} />

      <GrenseinformasjonField
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
          <GrenseinformasjonField
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

      <GrenseinformasjonField
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
      <GrenseinformasjonField
        feature={feature}
        tooltipLabel="Antatt posisjonsnøyaktighet i grunnriss (x, y) oppgitt i cm. Den nøyaktigheten som angis bør være så nær det virkelige objektet som mulig."
        fieldKey="noeyaktighet"
        fieldLabel="Nøyaktighet (cm)"
        renderItem={(register) => <Input type="number" {...register} />}
      />

      <GrenseinformasjonField
        feature={feature}
        tooltipLabel="Ansvarlig organisasjon som er opphav til grensedataene."
        fieldKey="opphav"
        fieldLabel="Opphav"
        renderItem={(register) => <Input placeholder="Fyll inn informasjon om opphav" {...register} />}
      />
      <GrenseinformasjonField
        feature={feature}
        tooltipLabel="Åpent felt med ekstra informasjon om grensen"
        fieldKey="informasjon"
        fieldLabel="Ekstra informasjon"
        renderItem={(register) => <Textarea placeholder="Fyll inn ekstra informasjon" {...register} />}
      />
      <OversiktVedtaksinfo feature={feature} />
    </Container>
  );
};

export default GrenseinformasjonFieldList;
