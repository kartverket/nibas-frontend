import { Feature } from "ol";
import { Geometry } from "ol/geom";
import { FeatureProperties } from "types/api";
import useIsMetadataDisabled from "../hooks/useIsMetadataDisabled";
import MetadataRow from "./MetadataRow";
import { Select, Stack } from "@kvib/react";
import { GrenseType } from "hooks/layers/types";
import { useTilhorighet } from "../hooks/useTilhorighet";
import { Flatedata } from "contexts/OverlayPanelContext";
import { getIdFromEntity } from "utils/api";
import { useEffect } from "react";

enum Tilhorighet {
  A = "a",
  B = "b",
}

type TilhorighetProps = {
  feature: Feature<Geometry>;
  disabledByFeatureLock?: boolean;
  tilhorighetToChange: "grunnkretser" | "stemmekretser";
  flatedata: Flatedata;
};

export const TilhorighetField = ({
  feature,
  disabledByFeatureLock,
  tilhorighetToChange,
  flatedata,
}: TilhorighetProps) => {
  const properties = feature.getProperties() as FeatureProperties;
  const kontekstEgenskaper = properties.kontekstEgenskaper;
  const kommuneId = flatedata ? getIdFromEntity(flatedata) : "";

  const metadataIsDisabled = useIsMetadataDisabled(feature, properties);

  const grenseType = properties.type as GrenseType;

  const {
    data: tilhorighetOptions,
    isDirty,
    getValuesFormatted,
    resetTilhorighet,
    getTilhorighetData,
    register,
    updateDraftFromFeature,
  } = useTilhorighet(
    feature,
    grenseType,
    kommuneId,
    tilhorighetToChange,
    kontekstEgenskaper,
  );

  useEffect(() => {
    resetTilhorighet();
  }, [getTilhorighetData, feature, tilhorighetOptions, resetTilhorighet]);
  return (
    <MetadataRow
      feature={feature}
      name={"Tilhørighet"}
      valueLabel={() => getValuesFormatted() ?? "Ikke definert"}
      onMetadataSubmit={() => updateDraftFromFeature()}
      isDisabled={metadataIsDisabled || disabledByFeatureLock}
      isDirty={isDirty}
      reset={resetTilhorighet}
    >
      <Stack>
        {Object.values(Tilhorighet).map((tilhorighet) => (
          <Select
            key={tilhorighet}
            {...register(`${tilhorighetToChange}.${tilhorighet}`)}
          >
            {tilhorighetOptions &&
              tilhorighetOptions.map((krets) => {
                const uid = `${tilhorighet}_${krets.id.lokalid.value}`;
                return (
                  <option key={uid} value={krets.id.lokalid.value}>
                    {krets.nummer} {krets.navn}
                  </option>
                );
              })}
          </Select>
        ))}
      </Stack>
    </MetadataRow>
  );
};
