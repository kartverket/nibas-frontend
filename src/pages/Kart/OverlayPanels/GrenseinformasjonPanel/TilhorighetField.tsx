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
import { useTilhorighet } from "../hooks/useTilhorighet";
import { useTilhorighetNyAdministrativ } from "../hooks/useTilhorighetNyAdministrativ";
import { isFeatureEditable } from "utils/features";
import { useFeatureStyle } from "contexts/FeatureStyleContext/FeatureStyleContext";
import useIsGrenseinformasjonPanelDisabled from "../hooks/useIsGrenseInformasjonPanelDisabled";
import GrenseinformasjonRowTilhorighet from "./GrenseinformasjonRowTilhorighet";
import { styled } from "styled-components";

type TilhorighetRowProps = {
  feature: Feature;
  useTilhorighet: UseTilhorighet;
  isDisabled?: boolean;
};

type CustomOptionProps = {
  kontekstType: KontekstType;
};

const NotChosenSelectOption = ({ kontekstType }: CustomOptionProps) => {
  return <option value={CustomOption.NOT_CHOSEN}>Velg {kontekstType.toLocaleLowerCase()}</option>;
};

// Dette er default, men en annen farge blir satt fra containeren
const WhiteSelect = styled(Select)`
  background-color: white;
`;

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
    <GrenseinformasjonRowTilhorighet
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
            <WhiteSelect key={tilhorighet} isDisabled={isDisabled} {...register(`${kontekstType}.${tilhorighet}`)}>
              <NotChosenSelectOption kontekstType={kontekstType} />
              {tilhorighetOptions?.[tilhorighet].map((krets) => {
                const uid = `${tilhorighet}_${krets.id.lokalid.value}`;
                return (
                  <option key={uid} value={krets.id.lokalid.value}>
                    {krets.nummer} {krets.navn}
                  </option>
                );
              })}
            </WhiteSelect>
          ))}
        </Stack>
      )}
    </GrenseinformasjonRowTilhorighet>
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

export const TilhorighetField = ({ feature, isDisabled }: TilhorighetProps) => {
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
