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

type Props = {
  feature: Feature<Geometry>;
  disabledByFeatureLock?: boolean;
  flatedata: Flatedata;
};

enum Tilhorighet {
  A = "a",
  B = "b",
}

export const StemmekretsTilhorighetField = ({
  feature,
  disabledByFeatureLock,
  flatedata,
}: Props) => {
  const properties = feature.getProperties() as FeatureProperties;
  const kommuneId = flatedata ? getIdFromEntity(flatedata) : "";

  const metadataIsDisabled = useIsMetadataDisabled(feature, properties);
  const tilhorighetToChange = "stemmekretser";

  const grenseType = properties.type as GrenseType;

  const {
    data: tilhorighetOptions,
    isDirty,
    getValuesFormatted,
    resetTilhorighet,
    getTilhorighetData,
    register,
    updateDraftFromFeature,
  } = useTilhorighet(feature, grenseType, kommuneId, tilhorighetToChange);

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
        <Select key={Tilhorighet.A} {...register("stemmekretser.a")}>
          {tilhorighetOptions &&
            tilhorighetOptions.map((krets) => {
              const uid = `${Tilhorighet.A}_${krets.id.lokalid.value}`;
              return (
                <option key={uid} value={krets.id.lokalid.value}>
                  {krets.nummer} {krets.navn}
                </option>
              );
            })}
        </Select>
        <Select key={Tilhorighet.B} {...register("stemmekretser.b")}>
          {tilhorighetOptions &&
            tilhorighetOptions.map((krets) => {
              const uid = `${Tilhorighet.B}_${krets.id.lokalid.value}`;
              return (
                <option key={uid} value={krets.id.lokalid.value}>
                  {krets.nummer} {krets.navn}
                </option>
              );
            })}
        </Select>
      </Stack>
    </MetadataRow>
  );
};

type TilhorighetProps = {
  feature: Feature<Geometry>;
  disabledByFeatureLock?: boolean;
  tilhorighetToChange: "grunnkretser" | "stemmekretser";
  flatedata: Flatedata;
};

export const TilhorighetField = ({
  feature,
  tilhorighetToChange,
  flatedata,
}: TilhorighetProps) => {
  return (
    <>
      {tilhorighetToChange == "grunnkretser" ? null : tilhorighetToChange ==
        "stemmekretser" ? (
        <StemmekretsTilhorighetField feature={feature} flatedata={flatedata} />
      ) : null}
    </>
  );
};
