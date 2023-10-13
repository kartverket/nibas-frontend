import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import { Metadata, FeatureProperties } from "types/api";
import useMetadataForm from "pages/Kart/OverlayPanels/hooks/useMetadataForm";
import useIsMetadataDisabled from "../hooks/useIsMetadataDisabled";
import { useEffect } from "react";
import { Datepicker, Input, Select, Textarea } from "@kvib/react";

import MetadataRow from "./MetadataRow";
import { GrenseType } from "../../../../hooks/layers/types";
import { getDateInFriendlyString } from "./utils";
import AsyncKodelisteSelect from "./AsyncKodelisteSelect";
import { styled } from "styled-components";

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
  "GRUNNKRETS",
  "STEMMEKRETS",
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
  const properties = feature.getProperties() as FeatureProperties;

  const metadata = properties.metadata as Metadata;
  const {
    register,
    updateDraftFromFeature,
    maalemetodeKoder,
    resetField,
    reset,
    dirtyFields,
    getFormFromApiMetadata,
  } = useMetadataForm(metadata, feature);
  // Still tilbake til default-verdier dersom man bytter valgt feature
  useEffect(() => {
    reset(getFormFromApiMetadata(metadata));
  }, [getFormFromApiMetadata, metadata, reset]);

  const metadataIsDisabled = useIsMetadataDisabled(properties);
  const disabledByFeatureLock = true; // Fleter låst med denne variabelen er ikke ment å bli tatt i bruk enda, og skal være låst inntil videre.

  const onSubmit = () => {
    updateDraftFromFeature();
  };

  return (
    <Container>
      <MetadataRow
        feature={feature}
        name={"Grensetype"}
        value={properties.type}
        onMetadataSubmit={onSubmit}
        isDisabled={disabledByFeatureLock}
        isDirty={dirtyFields.grenseType}
        reset={() => resetField("grenseType")}
      >
        <Select {...register("grenseType")}>
          {GrenseTypeValues.map((grenseType: GrenseType) => (
            <option key={grenseType}>{grenseType}</option>
          ))}
        </Select>
      </MetadataRow>
      <MetadataRow
        feature={feature}
        name="Datafangsdato"
        value={
          getDateInFriendlyString(metadata.common?.datafangstdato) ??
          "Ikke definert"
        }
        onMetadataSubmit={onSubmit}
        isDisabled={metadataIsDisabled}
        isDirty={dirtyFields.datafangstdato}
        reset={() => resetField("datafangstdato")}
      >
        <Datepicker {...register("datafangstdato")} />
      </MetadataRow>
      <MetadataRow
        feature={feature}
        name={"Gyldig fra"}
        value={
          getDateInFriendlyString(metadata.common?.gyldigFra) ?? "Ikke definert"
        }
        onMetadataSubmit={onSubmit}
        isDisabled={disabledByFeatureLock}
        isDirty={dirtyFields.gyldigFra}
        reset={() => resetField("gyldigFra")}
      >
        <Datepicker {...register("gyldigFra")} />
      </MetadataRow>
      <MetadataRow
        feature={feature}
        name={"Gyldig til"}
        value={
          getDateInFriendlyString(metadata.common?.gyldigTil) ?? "Ikke definert"
        }
        onMetadataSubmit={onSubmit}
        isDisabled={disabledByFeatureLock}
        isDirty={dirtyFields.gyldigTil}
        reset={() => resetField("gyldigTil")}
      >
        <Datepicker {...register("gyldigTil")} />
      </MetadataRow>
      <MetadataRow
        feature={feature}
        name={"Målemetode"}
        value={
          maalemetodeKoder?.items.find(
            (item) =>
              item.id ===
              metadata.commonGrense?.posisjonskvalitet?.maalemetode.id,
          )?.label ?? "Ukjent"
        }
        onMetadataSubmit={onSubmit}
        isDisabled={metadataIsDisabled}
        isDirty={dirtyFields.maalemetode}
        reset={() =>
          resetField("maalemetode", {
            defaultValue:
              metadata.commonGrense?.posisjonskvalitet?.maalemetode.id,
          })
        }
      >
        <AsyncKodelisteSelect
          kodeliste={maalemetodeKoder}
          {...register("maalemetode")}
        />
      </MetadataRow>
      <MetadataRow
        feature={feature}
        name={"Nøyaktighet (cm)"}
        value={metadata.commonGrense?.posisjonskvalitet?.noeyaktighet?.toString()}
        onMetadataSubmit={onSubmit}
        isDisabled={metadataIsDisabled}
        isDirty={dirtyFields.noeyaktighet}
        reset={() => {
          resetField("noeyaktighet");
        }}
      >
        <Input
          {...register("noeyaktighet", {
            valueAsNumber: true,
          })}
          type="number"
        />
      </MetadataRow>
      <MetadataRow
        feature={feature}
        name="Opphav"
        value={metadata.common?.opphav ?? ""}
        onMetadataSubmit={onSubmit}
        isDisabled={metadataIsDisabled}
        isDirty={dirtyFields.opphav}
        reset={() => resetField("opphav")}
      >
        <Input
          {...register("opphav")}
          placeholder={"Fyll inn informasjon om opphav"}
        />
      </MetadataRow>
      <MetadataRow
        feature={feature}
        name="Ekstra informasjon"
        value={metadata.common?.informasjon ?? ""}
        onMetadataSubmit={onSubmit}
        isDisabled={metadataIsDisabled}
        isDirty={dirtyFields.informasjon}
        reset={() => resetField("informasjon")}
      >
        <Textarea
          {...register("informasjon")}
          placeholder={"Fyll inn ekstra informasjon"}
        />
      </MetadataRow>
    </Container>
  );
};

export default MetadataGenerelt;
