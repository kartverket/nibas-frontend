import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import { Metadata, FeatureProperties } from "types/api";
import useMetadataForm from "pages/Kart/OverlayPanels/hooks/useMetadataForm";
import useIsMetadataDisabled from "../hooks/useIsMetadataDisabled";
import { useEffect } from "react";
import {
  Datepicker,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  Textarea,
} from "@kvib/react";

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
    reset,
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
    reset(undefined, { keepValues: true });
  };

  return (
    <Container>
      <MetadataRow
        name={"Grensetype"}
        value={properties.type}
        onMetadataSubmit={onSubmit}
        isDisabled={disabledByFeatureLock}
      >
        <Select {...register("grenseType")}>
          {GrenseTypeValues.map((grenseType: GrenseType) => (
            <option key={grenseType}>{grenseType}</option>
          ))}
        </Select>
      </MetadataRow>
      <MetadataRow
        name="Datafangsdato"
        value={
          getDateInFriendlyString(metadata.common?.datafangstdato) ??
          "Ikke definert"
        }
        onMetadataSubmit={onSubmit}
        isDisabled={metadataIsDisabled}
      >
        <Datepicker {...register("datafangstdato")} />
      </MetadataRow>
      <MetadataRow
        name={"Gyldig fra"}
        value={
          getDateInFriendlyString(metadata.common?.gyldigFra) ?? "Ikke definert"
        }
        onMetadataSubmit={onSubmit}
        isDisabled={disabledByFeatureLock}
      >
        <Datepicker {...register("gyldigFra")} />
      </MetadataRow>
      <MetadataRow
        name={"Gyldig til"}
        value={
          getDateInFriendlyString(metadata.common?.gyldigTil) ?? "Ikke definert"
        }
        onMetadataSubmit={onSubmit}
        isDisabled={disabledByFeatureLock}
      >
        <Datepicker {...register("gyldigTil")} />
      </MetadataRow>
      <MetadataRow
        name={"Målemetode"}
        value={
          maalemetodeKoder?.items.find(
            (item) =>
              item.id ===
              metadata.commonGrense?.posisjonskvalitet?.maalemetode.id,
          )?.label ?? "Ukjent"
        }
        onMetadataSubmit={onSubmit}
        useSeperateRowForChildren
        isDisabled={metadataIsDisabled}
      >
        <AsyncKodelisteSelect
          kodeliste={maalemetodeKoder}
          label="Målemetode"
          {...register("maalemetode")}
        />
      </MetadataRow>
      <MetadataRow
        name={"Nøyaktighet"}
        value={metadata.commonGrense?.posisjonskvalitet?.noeyaktighet?.toString()}
        onMetadataSubmit={onSubmit}
        isDisabled={metadataIsDisabled}
      >
        <NumberInput>
          <NumberInputField
            {...register("noeyaktighet", {
              valueAsNumber: true,
              min: 0,
              max: 1_000_000,
            })}
          />
          <NumberInputStepper />
        </NumberInput>
      </MetadataRow>
      <MetadataRow
        name="Opphav"
        value={metadata.common?.opphav ?? ""}
        onMetadataSubmit={onSubmit}
        useSeperateRowForChildren
        isDisabled={metadataIsDisabled}
      >
        <Input
          {...register("opphav")}
          placeholder={"Fyll inn informasjon om opphav"}
        />
      </MetadataRow>
      <MetadataRow
        name="Ekstra informasjon"
        value={metadata.common?.informasjon ?? ""}
        onMetadataSubmit={onSubmit}
        useSeperateRowForChildren
        isDisabled={metadataIsDisabled}
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
