import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import { Metadata, FeatureProperties } from "types/api";
import useMetadataForm from "pages/Kart/OverlayPanels/hooks/useMetadataForm";
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
import { MetadataRow } from "./MetadataRow";
import { GrenseType } from "../../../../hooks/layers/types";
import { getDateInFriendlyString } from "./utils";
import AsyncKodelisteSelect from "./AsyncKodelisteSelect";

const grenseTypeValues: GrenseType[] = [
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

  const onSubmit = () => {
    updateDraftFromFeature();
    reset(undefined, { keepValues: true });
  };

  return (
    <div>
      <MetadataRow
        name="Grensetype"
        value={properties.type}
        onMetadataSubmit={onSubmit}
        isDisabled
      >
        <Select {...register("grenseType")}>
          {grenseTypeValues.map((grenseType: GrenseType) => (
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
      >
        <Datepicker {...register("datafangstdato")} />
      </MetadataRow>
      <MetadataRow
        name="Gyldig fra"
        value={
          getDateInFriendlyString(metadata.common?.gyldigFra) ?? "Ikke definert"
        }
        onMetadataSubmit={onSubmit}
        isDisabled
      >
        <Datepicker {...register("gyldigFra")} />
      </MetadataRow>
      <MetadataRow
        name="Gyldig til"
        value={
          getDateInFriendlyString(metadata.common?.gyldigTil) ?? "Ikke definert"
        }
        onMetadataSubmit={onSubmit}
        isDisabled
      >
        <Datepicker {...register("gyldigTil")} />
      </MetadataRow>
      <MetadataRow
        name="Målemetode"
        value={
          maalemetodeKoder?.items.find(
            (item) =>
              item.id ===
              metadata.commonGrense?.posisjonskvalitet?.maalemetode.id
          )?.label ?? "Ukjent"
        }
        onMetadataSubmit={onSubmit}
        useSeperateRowForChildren
      >
        <AsyncKodelisteSelect
          kodeliste={maalemetodeKoder}
          label="Målemetode"
          {...register("maalemetode")}
        />
      </MetadataRow>
      <MetadataRow
        name="Nøyaktighet"
        value={metadata.commonGrense?.posisjonskvalitet?.noeyaktighet?.toString()}
        onMetadataSubmit={onSubmit}
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
      >
        <Input
          {...register("opphav")}
          placeholder="Fyll inn informasjon om opphav"
        />
      </MetadataRow>
      <MetadataRow
        name="Ekstra informasjon"
        value={metadata.common?.informasjon ?? ""}
        onMetadataSubmit={onSubmit}
        useSeperateRowForChildren
      >
        <Textarea
          {...register("informasjon")}
          placeholder="Fyll inn ekstra informasjon"
          minHeight="100%"
        />
      </MetadataRow>
    </div>
  );
};

export default MetadataGenerelt;
