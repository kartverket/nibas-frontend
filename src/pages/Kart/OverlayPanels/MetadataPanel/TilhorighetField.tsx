import { Feature } from "ol";
import { Geometry } from "ol/geom";
import { FeatureProperties } from "types/api";
import useIsMetadataDisabled from "../hooks/useIsMetadataDisabled";
import MetadataRow from "./MetadataRow";
import { Select, Stack } from "@kvib/react";
import { useTilhorighet } from "../hooks/useTilhorighet";
import { useEffect } from "react";
import { isAdministrativGrense } from "utils/grenser";
import { GrenseType } from "hooks/layers/types";
import { useAdministrativTilhorighet } from "../hooks/useAdministrativTilhorighet";
import { Tilhorighet, getTilhorighetValuesFormatted } from "../hooks/tilhorighetUtils";

type TilhorighetProps = {
  feature: Feature<Geometry>;
  isDisabled?: boolean;
};

const DefaultTilhorighetField = ({ feature, isDisabled }: TilhorighetProps) => {
  const properties = feature.getProperties() as FeatureProperties;

  const metadataIsDisabled = useIsMetadataDisabled(feature, properties);

  const {
    kontekstType,
    data: tilhorighetOptions,
    isDirty,
    resetTilhorighet,
    getTilhorighetData,
    register,
    updateDraftFromFeature,
    getValues,
  } = useTilhorighet(feature);

  useEffect(() => {
    resetTilhorighet();
  }, [getTilhorighetData, feature, tilhorighetOptions, resetTilhorighet]);

  return (
    <MetadataRow
      feature={feature}
      name="Tilhørighet"
      valueLabel={getTilhorighetValuesFormatted(getValues(kontekstType), tilhorighetOptions)}
      onMetadataSubmit={() => updateDraftFromFeature()}
      isDisabled={metadataIsDisabled || isDisabled}
      isDirty={isDirty}
      reset={resetTilhorighet}
      tooltipLabel="Definerer hvilke inndelinger grensen har på hver sin side. Obs! Endring av dette feltet kan forårsake geometriendringer."
    >
      {kontekstType && (
        <Stack>
          {Object.values(Tilhorighet).map((tilhorighet) => (
            <Select key={tilhorighet} {...register(`${kontekstType}.${tilhorighet}`)}>
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

const AdministrativTilhorighetField = ({ feature, isDisabled }: TilhorighetProps) => {
  const {
    kontekstType,
    data: tilhorighetOptions,
    register,
    resetTilhorighet,
    getTilhorighetData,
    isDirty,
    updateDraftFromFeature,
    getValues,
    isLoading,
  } = useAdministrativTilhorighet(feature);

  useEffect(() => {
    resetTilhorighet();
  }, [getTilhorighetData, feature, tilhorighetOptions, resetTilhorighet]);

  return (
    <MetadataRow
      feature={feature}
      name="Tilhørighet"
      valueLabel={getTilhorighetValuesFormatted(getValues(kontekstType), tilhorighetOptions)}
      onMetadataSubmit={() => updateDraftFromFeature()}
      isDisabled={isDisabled}
      isDirty={isDirty}
      isLoading={isLoading}
      reset={resetTilhorighet}
      tooltipLabel="Definerer hvilke inndelinger grensen har på hver sin side. Obs! Endring av dette feltet kan forårsake geometriendringer."
    >
      {kontekstType && (
        <Stack>
          {Object.values(Tilhorighet).map((tilhorighet) => (
            <Select key={tilhorighet} {...register(`${kontekstType}.${tilhorighet}`)}>
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

export const TilhorighetField = ({ feature, isDisabled }: TilhorighetProps) => {
  const properties = feature.getProperties() as FeatureProperties;
  return isAdministrativGrense(properties.type as GrenseType) ? (
    <AdministrativTilhorighetField feature={feature} isDisabled={false} />
  ) : (
    <DefaultTilhorighetField feature={feature} isDisabled={isDisabled} />
  );
};
