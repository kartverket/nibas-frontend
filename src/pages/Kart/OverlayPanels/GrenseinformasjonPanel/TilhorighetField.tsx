import { Select, Stack } from "@kvib/react";
import { GrenseType } from "hooks/layers/types";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import { isTempFeatureId } from "pages/Kart/interactions/tempFeatureIdUtil";
import { isAdministrativGrense } from "utils/grenser";
import {
  CustomOption,
  KontekstType,
  Tilhorighet,
  UseTilhorighet,
  getTilhorighetValuesFormatted,
} from "../hooks/tilhorighetUtils";
import { useTilhorighetAdministrativ } from "../hooks/useTilhorighetAdministrativ";
import GrenseinformasjonRow from "pages/Kart/OverlayPanels/GrenseinformasjonPanel/GrenseinformasjonRow";
import { useTilhorighet } from "../hooks/useTilhorighet";
import { useTilhorighetNyAdministrativ } from "../hooks/useTilhorighetNyAdministrativ";
import { isFeatureEditable } from "utils/features";
import { useFeatureStyle } from "contexts/FeatureStyleContext";
import useIsGrenseinformasjonPanelDisabled from "../hooks/useIsGrenseInformasjonPanelDisabled";
import { UseFormGetValues, UseFormRegister } from "react-hook-form";
import { GrenseinformasjonFormProps } from "../hooks/useGrenseinformasjonForm";

type TilhorighetRowProps = TilhorighetProps & {
  useTilhorighet: UseTilhorighet;
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
  isEditing,
  getValues,
  register,
  useTilhorighet: { kontekstType, tilhorighetOptions, isLoading },
}: TilhorighetRowProps) => {
  return (
    kontekstType && (
      <GrenseinformasjonRow
        name="Tilhørighet"
        tooltipLabel="Definerer hvilke inndelinger grensen har på hver sin side. Obs! Endring av dette feltet kan forårsake geometriendringer."
        valueLabel={
          getTilhorighetValuesFormatted(getValues(`tilhorighet.${kontekstType}`), tilhorighetOptions) ??
          (isTempFeatureId(feature.getId()?.toString()) ? "Ny grense - Mangler tilhørighet" : undefined)
        }
        isLoading={isLoading}
        isEditing={isEditing}
      >
        <Stack>
          {Object.values(Tilhorighet).map((tilhorighet) => (
            <Select key={tilhorighet} {...register(`tilhorighet.${kontekstType}.${tilhorighet}`)}>
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
      </GrenseinformasjonRow>
    )
  );
};

type TilhorighetProps = {
  feature: Feature<Geometry>;
  isDisabled?: boolean;
  isEditing?: boolean;
  getValues: UseFormGetValues<GrenseinformasjonFormProps>;
  register: UseFormRegister<GrenseinformasjonFormProps>;
};

const CommonTilhorighetField = ({ feature, isDisabled, isEditing, register, getValues }: TilhorighetProps) => {
  return (
    <TilhorighetRow
      feature={feature}
      useTilhorighet={useTilhorighet(feature)}
      isEditing={isEditing}
      isDisabled={isDisabled}
      register={register}
      getValues={getValues}
    />
  );
};

const AdministrativTilhorighetField = ({ feature, isDisabled, isEditing, register, getValues }: TilhorighetProps) => {
  return (
    <TilhorighetRow
      feature={feature}
      useTilhorighet={useTilhorighetAdministrativ(feature)}
      isEditing={isEditing}
      isDisabled={isDisabled}
      register={register}
      getValues={getValues}
    />
  );
};

const NyAdministrativTilhorighetField = ({ feature, isDisabled, isEditing, register, getValues }: TilhorighetProps) => {
  return (
    <TilhorighetRow
      feature={feature}
      useTilhorighet={useTilhorighetNyAdministrativ(feature)}
      isEditing={isEditing}
      isDisabled={isDisabled}
      register={register}
      getValues={getValues}
    />
  );
};

export const TilhorighetField = ({ feature, isDisabled, isEditing, register, getValues }: TilhorighetProps) => {
  const { featureIsArchived } = useFeatureStyle();

  const isGrensePanelDisabled = useIsGrenseinformasjonPanelDisabled(feature);

  const grenseType = feature.getProperties().type as GrenseType;

  if (isAdministrativGrense(grenseType)) {
    const isEditable = isFeatureEditable(feature, featureIsArchived(feature));

    const shouldBeDisabled = isDisabled || isGrensePanelDisabled || !isEditable;
    if (isTempFeatureId(feature.getId())) {
      return (
        <NyAdministrativTilhorighetField
          feature={feature}
          isEditing={isEditing}
          isDisabled={shouldBeDisabled}
          register={register}
          getValues={getValues}
        />
      );
    }
    return (
      <AdministrativTilhorighetField
        feature={feature}
        isEditing={isEditing}
        isDisabled={shouldBeDisabled}
        register={register}
        getValues={getValues}
      />
    );
  }

  const shouldBeDisabled = isDisabled || isGrensePanelDisabled;
  return (
    <CommonTilhorighetField
      feature={feature}
      isEditing={isEditing}
      isDisabled={shouldBeDisabled}
      register={register}
      getValues={getValues}
    />
  );
};
