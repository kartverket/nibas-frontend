import { Select, Stack } from "@kvib/react";
import { GrenseType } from "hooks/layers/types";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import { isTempFeatureId } from "pages/Kart/interactions/tempFeatureIdUtil";
import { useEffect } from "react";
import { isAdministrativGrense } from "utils/grenser";
import {
  CustomOption,
  KontekstType,
  Tilhorighet,
  UseTilhorighet,
  getTilhorighetValuesFormatted,
} from "../hooks/tilhorighetUtils";
import { useAdministrativTilhorighet } from "../hooks/useAdministrativTilhorighet";
import { useTilhorighet } from "../hooks/useTilhorighet";
import MetadataRow from "./MetadataRow";

type TilhorighetRowProps = {
  feature: Feature;
  useTilhorighet: UseTilhorighet;
  isDisabled?: boolean;
};

type CustomOptionProps = {
  feature: Feature;
  kontekstType: KontekstType;
};

export const NotChosenSelectOption = ({ feature, kontekstType }: CustomOptionProps) => {
  return (
    isTempFeatureId(feature.getId()?.toString()) && (
      <option value={CustomOption.NOT_CHOSEN}>Velg {kontekstType.toLocaleLowerCase()}</option>
    )
  );
};

const TilhorighetRow = ({
  feature,
  useTilhorighet: {
    kontekstType,
    tilhorighetOptions,
    isDirty,
    register,
    resetTilhorighet,
    updateDraftFromFeature,
    getValues,
    isLoading,
  },
  isDisabled,
}: TilhorighetRowProps) => {
  useEffect(() => {
    resetTilhorighet();
  }, [resetTilhorighet]);

  return (
    <MetadataRow
      feature={feature}
      name="Tilhørighet"
      valueLabel={
        getTilhorighetValuesFormatted(getValues(kontekstType), tilhorighetOptions) ??
        (isTempFeatureId(feature.getId()?.toString()) ? "Ny grense - Mangler tilhørighet" : undefined)
      }
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
              <NotChosenSelectOption feature={feature} kontekstType={kontekstType} />
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

type TilhorighetProps = {
  feature: Feature<Geometry>;
  isDisabled?: boolean;
};

const CommonTilhorighetField = ({ feature, isDisabled }: TilhorighetProps) => {
  return <TilhorighetRow feature={feature} useTilhorighet={useTilhorighet(feature)} isDisabled={isDisabled} />;
};

const AdministrativTilhorighetField = ({ feature, isDisabled }: TilhorighetProps) => {
  return (
    <TilhorighetRow feature={feature} useTilhorighet={useAdministrativTilhorighet(feature)} isDisabled={isDisabled} />
  );
};

export const TilhorighetField = ({ feature, isDisabled }: TilhorighetProps) => {
  const grenseType = feature.getProperties().type as GrenseType;
  return isAdministrativGrense(grenseType) ? (
    <AdministrativTilhorighetField feature={feature} isDisabled={grenseType !== "Kommunegrense"} />
  ) : (
    <CommonTilhorighetField feature={feature} isDisabled={isDisabled} />
  );
};
