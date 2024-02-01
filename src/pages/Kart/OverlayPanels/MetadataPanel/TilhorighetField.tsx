import { Feature } from "ol";
import { Geometry } from "ol/geom";
import { FeatureProperties } from "types/api";
import useIsMetadataDisabled from "../hooks/useIsMetadataDisabled";
import MetadataRow from "./MetadataRow";
import { Select, Stack } from "@kvib/react";
import { useTilhorighet } from "../hooks/useTilhorighet";
import { useEffect } from "react";

enum Tilhorighet {
  A = "a",
  B = "b",
}

type TilhorighetProps = {
  feature: Feature<Geometry>;
  isDisabled?: boolean;
};

export const TilhorighetField = ({ feature, isDisabled }: TilhorighetProps) => {
  const properties = feature.getProperties() as FeatureProperties;
  const kontekstEgenskaper = properties.kontekstEgenskaper;

  const metadataIsDisabled = useIsMetadataDisabled(feature, properties);

  const {
    tilhorighetToChange,
    data: tilhorighetOptions,
    isDirty,
    getValuesFormatted,
    resetTilhorighet,
    getTilhorighetData,
    register,
    updateDraftFromFeature,
  } = useTilhorighet(feature, kontekstEgenskaper);

  useEffect(() => {
    resetTilhorighet();
  }, [getTilhorighetData, feature, tilhorighetOptions, resetTilhorighet]);

  return (
    <MetadataRow
      feature={feature}
      name="Tilhørighet"
      valueLabel={getValuesFormatted() ?? "Ikke definert"}
      onMetadataSubmit={() => updateDraftFromFeature()}
      isDisabled={metadataIsDisabled || isDisabled}
      isDirty={isDirty}
      reset={resetTilhorighet}
      tooltipLabel="Definerer hvilke inndelinger grensen har på hver sin side. Obs! Endring av dette feltet kan forårsake geometriendringer."
    >
      {tilhorighetToChange && (
        <Stack>
          {Object.values(Tilhorighet).map((tilhorighet) => (
            <Select
              key={tilhorighet}
              {...register(`${tilhorighetToChange}.${tilhorighet}`)}
            >
              {tilhorighetOptions &&
                tilhorighetOptions[tilhorighet].map((krets) => {
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
      )}
    </MetadataRow>
  );
};
