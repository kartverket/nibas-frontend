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
import { useEffect, useState } from "react";
import { FlateFormModal } from "./FlateOpprettelseModal";

enum Tilhorighet {
  A = "a",
  B = "b",
}

enum Option {
  NY_FLATE = "NY_FLATE",
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
  const [isFlateModalOpen, setIsFlateModalOpen] = useState(false);

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

  const tilhorighetRegisters = {
    [Tilhorighet.A]: { ...register(`${tilhorighetToChange}.${Tilhorighet.A}`) },
    [Tilhorighet.B]: { ...register(`${tilhorighetToChange}.${Tilhorighet.B}`) },
  };

  return (
    <>
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
              {...tilhorighetRegisters[tilhorighet]}
              onChange={(e) => {
                tilhorighetRegisters[tilhorighet].onChange(e);
                if (e.target.value === Option.NY_FLATE) {
                  setIsFlateModalOpen(true);
                }
              }}
            >
              <option key={Option.NY_FLATE} value={Option.NY_FLATE}>
                {"<Opprett ny flate>"}
              </option>
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
      <FlateFormModal
        isOpen={isFlateModalOpen}
        onClose={() => setIsFlateModalOpen(false)}
        featureProps={properties}
        flatedata={flatedata}
      />
    </>
  );
};
