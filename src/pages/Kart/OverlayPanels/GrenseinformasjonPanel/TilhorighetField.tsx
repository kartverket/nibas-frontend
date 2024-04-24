import { Stack, Text } from "@kvib/react";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import { isTempFeatureId } from "pages/Kart/interactions/temp-feature-id-utils";
import { useEffect } from "react";
import { isAdministrativGrense, isKommuneGrense } from "utils/grenser";
import {
  formatKretsNavn,
  KontekstType,
  Tilhorighet,
  TilhorighetChoice,
  TilhorighetOptions,
  UseTilhorighet,
} from "../hooks/tilhorighet-utils";
import { useTilhorighetKommune } from "../hooks/useTilhorighetKommune";
import { useTilhorighet } from "../hooks/useTilhorighet";
import { isFeatureEditable, isFeatureToBeArchived } from "utils/features";
import useIsGrenseinformasjonPanelDisabled from "../hooks/useIsGrenseInformasjonPanelDisabled";
import GrenseinformasjonRowTilhorighet from "./GrenseinformasjonRowTilhorighet";
import { isGrenseType } from "utils/type-utils";
import { useTilhorighetIkkeRedigerbar } from "pages/Kart/OverlayPanels/hooks/useTilhorighetIkkeRedigerbar";
import { TilhorighetSearch } from "pages/Kart/OverlayPanels/GrenseinformasjonPanel/TilhorighetSearch";

type TilhorighetRowProps = {
  feature: Feature;
  useTilhorighet: UseTilhorighet;
  isDisabled?: boolean;
};

const TilhorighetRow = ({
  feature,
  useTilhorighet: {
    kontekstType,
    tilhorighetOptions,
    isDirty,
    resetTilhorighet,
    updateDraftFromFeature,
    formState,
    setValue,
    isLoading,
  },
  isDisabled,
}: TilhorighetRowProps) => {
  useEffect(() => {
    resetTilhorighet();
  }, [resetTilhorighet]);

  const isValid = formState[kontekstType][Tilhorighet.A] != null && formState[kontekstType][Tilhorighet.B] != null;

  return (
    <GrenseinformasjonRowTilhorighet
      feature={feature}
      name={`Tilhørighet (${kontekstType.toLocaleLowerCase()})`}
      valueLabel={
        getTilhorighetValuesFormatted(formState[kontekstType], tilhorighetOptions) ??
        (isTempFeatureId(feature.getId()?.toString()) ? "Ny grense - Mangler tilhørighet" : undefined)
      }
      onMetadataSubmit={() => updateDraftFromFeature()}
      isDisabled={isDisabled}
      isDirty={isDirty}
      isValid={isValid}
      isLoading={isLoading}
      reset={resetTilhorighet}
      tooltipLabel="Definerer hvilke inndelinger grensen har på hver sin side. Obs! Endring av dette feltet kan forårsake geometriendringer."
    >
      <Stack>
        {Object.values(Tilhorighet).map((tilhorighet) => (
          <div key={tilhorighet}>
            <TilhorighetSearch
              value={formState[kontekstType][tilhorighet]}
              kretsType={kontekstType}
              onChange={(newValue) => setValue(tilhorighet, newValue)}
              options={
                tilhorighetOptions?.[tilhorighet]?.map((krets) => ({
                  value: krets.id.lokalid.value,
                  label: formatKretsNavn(krets),
                })) ?? []
              }
            />
          </div>
        ))}
      </Stack>
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

const KommunegrenseTilhorighetField = ({ feature, isDisabled }: TilhorighetProps) => {
  const useTilhorighetGrunnkrets = useTilhorighetKommune(feature, KontekstType.GRUNNKRETS);
  const useTilhorighetStemmekrets = useTilhorighetKommune(feature, KontekstType.STEMMEKRETS);

  return (
    <>
      <TilhorighetRow feature={feature} useTilhorighet={useTilhorighetGrunnkrets} isDisabled={isDisabled} />
      <TilhorighetRow feature={feature} useTilhorighet={useTilhorighetStemmekrets} isDisabled={isDisabled} />
    </>
  );
};

const IkkeRedigerbarAdministrativGrense = ({ feature }: TilhorighetProps) => {
  const useTilhorighetGrunnkrets = useTilhorighetIkkeRedigerbar(feature, KontekstType.GRUNNKRETS);
  const useTilhorighetStemmekrets = useTilhorighetIkkeRedigerbar(feature, KontekstType.STEMMEKRETS);

  return (
    <>
      <TilhorighetRow feature={feature} useTilhorighet={useTilhorighetGrunnkrets} isDisabled />
      <TilhorighetRow feature={feature} useTilhorighet={useTilhorighetStemmekrets} isDisabled />
    </>
  );
};

export const TilhorighetField = ({ feature, isDisabled = false }: TilhorighetProps) => {
  const isGrensePanelDisabled = useIsGrenseinformasjonPanelDisabled(feature);

  const featureType = feature.getProperties().type;

  if (isGrenseType(featureType) && isKommuneGrense(featureType)) {
    const isEditable = isFeatureEditable(feature, isFeatureToBeArchived(feature), false);
    const shouldBeDisabled = isDisabled || isGrensePanelDisabled || !isEditable;
    return <KommunegrenseTilhorighetField feature={feature} isDisabled={shouldBeDisabled} />;
  } else if (isGrenseType(featureType) && isAdministrativGrense(featureType)) {
    return <IkkeRedigerbarAdministrativGrense feature={feature} />;
  }

  const shouldBeDisabled = isDisabled || isGrensePanelDisabled;
  return <CommonTilhorighetField feature={feature} isDisabled={shouldBeDisabled} />;
};

const getTilhorighetValuesFormatted = (
  formState: TilhorighetChoice,
  tilhorighetOptions: TilhorighetOptions | null | undefined,
) => {
  if (formState.a != null && formState.b != null && tilhorighetOptions) {
    const kretsA = tilhorighetOptions[Tilhorighet.A].find(
      (krets) => krets.id.lokalid.value === formState[Tilhorighet.A],
    );
    const kretsB = tilhorighetOptions[Tilhorighet.B].find(
      (krets) => krets.id.lokalid.value === formState[Tilhorighet.B],
    );

    if (!kretsA && !kretsB) {
      return undefined;
    } else {
      return (
        <>
          <Text>{formatKretsNavn(kretsA)}</Text>
          <Text>{formatKretsNavn(kretsB)}</Text>
        </>
      );
    }
  }
};
