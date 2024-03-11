import { Select, Stack } from "@kvib/react";
import { GrenseType } from "hooks/layers/types";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import { isTempFeatureId } from "pages/Kart/interactions/temp-feature-id-utils";
import { useEffect } from "react";
import { isAdministrativGrense } from "utils/grenser";
import {
  CustomOption,
  KontekstType,
  Tilhorighet,
  UseTilhorighet,
  getTilhorighetValuesFormatted,
} from "../hooks/tilhorighet-utils";
import { useTilhorighetAdministrativ } from "../hooks/useTilhorighetAdministrativ";
import GrenseinformasjonRow from "pages/Kart/OverlayPanels/GrenseinformasjonPanel/GrenseinformasjonRow";
import { useTilhorighet } from "../hooks/useTilhorighet";
import { useTilhorighetNyAdministrativ } from "../hooks/useTilhorighetNyAdministrativ";
import { isFeatureEditable } from "utils/features";
import { useFeatureStyle } from "contexts/FeatureStyleContext/FeatureStyleContext";
import useIsGrenseinformasjonPanelDisabled from "../hooks/useIsGrenseInformasjonPanelDisabled";

type TilhorighetRowProps = {
  feature: Feature;
  useTilhorighet: UseTilhorighet;
  isDisabled?: boolean;
};

type CustomOptionProps = {
  feature: Feature;
  kontekstType: KontekstType;
};

const NotChosenSelectOption = ({ feature, kontekstType }: CustomOptionProps) => {
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
    <GrenseinformasjonRow
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
      {kontekstType !== undefined && (
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
    </GrenseinformasjonRow>
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
    <TilhorighetRow feature={feature} useTilhorighet={useTilhorighetAdministrativ(feature)} isDisabled={isDisabled} />
  );
};

const NyAdministrativTilhorighetField = ({ feature, isDisabled }: TilhorighetProps) => {
  return (
    <TilhorighetRow feature={feature} useTilhorighet={useTilhorighetNyAdministrativ(feature)} isDisabled={isDisabled} />
  );
};

export const TilhorighetField = ({ feature, isDisabled = false }: TilhorighetProps) => {
  const { featureIsArchived } = useFeatureStyle();

  const isGrensePanelDisabled = useIsGrenseinformasjonPanelDisabled(feature);

  const grenseType = feature.getProperties().type as GrenseType;

  if (isAdministrativGrense(grenseType)) {
    const isEditable = isFeatureEditable(feature, featureIsArchived(feature));

    const shouldBeDisabled = isDisabled || isGrensePanelDisabled || !isEditable;
    if (isTempFeatureId(feature.getId())) {
      return <NyAdministrativTilhorighetField feature={feature} isDisabled={shouldBeDisabled} />;
    }
    return <AdministrativTilhorighetField feature={feature} isDisabled={shouldBeDisabled} />;
  }

  const shouldBeDisabled = isDisabled || isGrensePanelDisabled;
  return <CommonTilhorighetField feature={feature} isDisabled={shouldBeDisabled} />;
};
