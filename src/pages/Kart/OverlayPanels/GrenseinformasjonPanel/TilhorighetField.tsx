import { Stack, Text } from "@kvib/react";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { Feature } from "ol";
import { Geometry, LineString } from "ol/geom";
import { TilhorighetSearch } from "pages/Kart/OverlayPanels/GrenseinformasjonPanel/TilhorighetSearch";
import { useTilhorighetIkkeRedigerbar } from "pages/Kart/OverlayPanels/hooks/useTilhorighetIkkeRedigerbar";
import { isTempFeatureId } from "pages/Kart/interactions/temp-feature-id-utils";
import { useEffect, useState } from "react";
import { styled } from "styled-components";
import { FeatureProperties } from "types/api";
import { isFeatureEditable, isFeatureToBeArchived } from "utils/features";
import { isAdministrativGrense, isKommuneGrense } from "utils/grenser";
import { capitalize } from "utils/string-utils";
import { isGrenseType } from "utils/type-utils";
import {
  KontekstType,
  Tilhorighet,
  TilhorighetChoice,
  TilhorighetOptions,
  UseTilhorighet,
  formatKretsNavn,
  getKontekstTypeForFeature,
} from "../hooks/tilhorighet-utils";
import useIsGrenseinformasjonPanelDisabled from "../hooks/useIsGrenseInformasjonPanelDisabled";
import { useTilhorighet } from "../hooks/useTilhorighet";
import { useTilhorighetKommune } from "../hooks/useTilhorighetKommune";
import { EditGrenseInfoButton } from "./GrenseinformasjonForm";
import GrenseinformasjonRowTilhorighet from "./GrenseinformasjonRowTilhorighet";
import { addKontekstEntryFromFeature } from "./grenseinformasjon-utils";

type TilhorighetRowProps = {
  feature: Feature;
  useTilhorighet: UseTilhorighet;
  isDisabled?: boolean;
  isValid: boolean;
  isSubmitted: boolean;
  isEditing: boolean;
};

const TilhorighetRow = ({
  feature,
  useTilhorighet: { kontekstType, tilhorighetOptions, resetTilhorighet, formState, setValue, isLoading },
  isSubmitted,
  isValid,
  isEditing,
}: TilhorighetRowProps) => {
  useEffect(() => {
    resetTilhorighet();
  }, [resetTilhorighet]);

  return (
    <GrenseinformasjonRowTilhorighet
      isEditing={isEditing}
      isSubmitted={isSubmitted}
      name={capitalize(kontekstType.toLocaleLowerCase()) + "er"}
      valueLabel={
        getTilhorighetValuesFormatted(formState[kontekstType], tilhorighetOptions) ??
        (isTempFeatureId(feature.getId()?.toString()) ? "Ny grense - Mangler tilhørighet" : undefined)
      }
      isValid={isValid}
      isLoading={isLoading}
      tooltipLabel={`
      Definerer hvilke ${kontekstType.toLocaleLowerCase()}er grensen har på hver sin side. Obs! Endring av dette feltet kan forårsake geometriendringer.
      `}
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
  const { addHistoryEntry } = useHistory();
  const commonTilhorighet = useTilhorighet(feature);
  const featureProperties = feature.getProperties() as FeatureProperties;
  const kontekstType = getKontekstTypeForFeature(featureProperties.kontekstEgenskaper, featureProperties);
  const isValid =
    commonTilhorighet.formState[kontekstType][Tilhorighet.A] != null &&
    commonTilhorighet.formState[kontekstType][Tilhorighet.B] != null;
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const submit = () => {
    const oppdaterteKontekster = commonTilhorighet.getCurrentOppdaterteKontekstEgenskaper();
    if (oppdaterteKontekster != null) {
      addKontekstEntryFromFeature(feature as Feature<LineString>, oppdaterteKontekster, addHistoryEntry);
    }
  };

  const isDirty = commonTilhorighet.isDirty;
  useEffect(() => {
    setIsEditing(false);
  }, [feature]);
  const handleSubmit = () => {
    if (isDirty && isValid) {
      setIsSubmitted(true);
      submit();
    } else setIsSubmitted(false);
  };
  return (
    <>
      <TilhorighetFieldHeader>
        <Text as={"b"} fontSize={"lg"}>
          Tilhørighet
        </Text>
        <EditGrenseInfoButton
          isEditing={isEditing}
          handleSubmit={handleSubmit}
          toggleEdit={() =>
            setIsEditing((prevState) => {
              if (isEditing && !isDirty) {
                commonTilhorighet.resetTilhorighet();
                setIsSubmitted(false);
              }
              return !prevState;
            })
          }
        />
      </TilhorighetFieldHeader>
      <TilhorighetRow
        isEditing={isEditing}
        isSubmitted={isSubmitted}
        isValid={isValid}
        feature={feature}
        useTilhorighet={commonTilhorighet}
        isDisabled={isDisabled}
      />
    </>
  );
};

const KommunegrenseTilhorighetField = ({ feature, isDisabled }: TilhorighetProps) => {
  const { addHistoryEntry } = useHistory();
  const useTilhorighetGrunnkrets = useTilhorighetKommune(feature, KontekstType.GRUNNKRETS);
  const useTilhorighetStemmekrets = useTilhorighetKommune(feature, KontekstType.STEMMEKRETS);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isDirty = useTilhorighetGrunnkrets.isDirty || useTilhorighetStemmekrets.isDirty;
  const isValid =
    useTilhorighetGrunnkrets.formState[KontekstType.GRUNNKRETS][Tilhorighet.A] != null &&
    useTilhorighetGrunnkrets.formState[KontekstType.GRUNNKRETS][Tilhorighet.B] != null &&
    useTilhorighetStemmekrets.formState[KontekstType.STEMMEKRETS][Tilhorighet.A] != null &&
    useTilhorighetStemmekrets.formState[KontekstType.STEMMEKRETS][Tilhorighet.B] != null;

  useEffect(() => {
    setIsEditing(false);
  }, [feature]);

  const submitAll = () => {
    const oppdaterteGrunnkretsTilhorigheter = useTilhorighetGrunnkrets.getCurrentOppdaterteKontekstEgenskaper();
    const oppdaterteStemmekretsTilhorigheter = useTilhorighetStemmekrets.getCurrentOppdaterteKontekstEgenskaper();
    if (oppdaterteGrunnkretsTilhorigheter != null && oppdaterteStemmekretsTilhorigheter != null) {
      addKontekstEntryFromFeature(
        feature as Feature<LineString>,
        [...oppdaterteGrunnkretsTilhorigheter, ...oppdaterteStemmekretsTilhorigheter],
        addHistoryEntry,
      );
    }
  };

  const resetAll = () => {
    useTilhorighetGrunnkrets.resetTilhorighet();
    useTilhorighetStemmekrets.resetTilhorighet();
  };

  const handleSubmit = () => {
    if (isDirty && isValid) {
      setIsSubmitted(true);
      submitAll();
    } else setIsSubmitted(false);
  };

  return (
    <>
      <TilhorighetFieldHeader>
        <Text as={"b"} fontSize={"lg"}>
          Tilhørighet
        </Text>
        <EditGrenseInfoButton
          isEditing={isEditing}
          handleSubmit={handleSubmit}
          toggleEdit={() =>
            setIsEditing((prevState) => {
              if (isEditing && !isDirty) {
                resetAll();
                setIsSubmitted(false);
              }
              return !prevState;
            })
          }
        />
      </TilhorighetFieldHeader>

      <TilhorighetRow
        isEditing={isEditing}
        isSubmitted={isSubmitted}
        isValid={isValid}
        feature={feature}
        useTilhorighet={useTilhorighetGrunnkrets}
        isDisabled={isDisabled}
      />
      <TilhorighetRow
        isEditing={isEditing}
        isSubmitted={isSubmitted}
        isValid={isValid}
        feature={feature}
        useTilhorighet={useTilhorighetStemmekrets}
        isDisabled={isDisabled}
      />
    </>
  );
};

const IkkeRedigerbarAdministrativGrense = ({ feature }: TilhorighetProps) => {
  const { addHistoryEntry } = useHistory();
  const useTilhorighetGrunnkrets = useTilhorighetIkkeRedigerbar(feature, KontekstType.GRUNNKRETS);
  const useTilhorighetStemmekrets = useTilhorighetIkkeRedigerbar(feature, KontekstType.STEMMEKRETS);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isDirty = useTilhorighetGrunnkrets.isDirty || useTilhorighetStemmekrets.isDirty;
  const isValid =
    useTilhorighetGrunnkrets.formState[KontekstType.GRUNNKRETS][Tilhorighet.A] != null &&
    useTilhorighetGrunnkrets.formState[KontekstType.GRUNNKRETS][Tilhorighet.B] != null &&
    useTilhorighetStemmekrets.formState[KontekstType.STEMMEKRETS][Tilhorighet.A] != null &&
    useTilhorighetStemmekrets.formState[KontekstType.STEMMEKRETS][Tilhorighet.B] != null;

  useEffect(() => {
    setIsEditing(false);
  }, [feature]);

  const submitAll = () => {
    const oppdaterteGrunnkretsTilhorigheter = useTilhorighetGrunnkrets.getCurrentOppdaterteKontekstEgenskaper();
    const oppdaterteStemmekretsTilhorigheter = useTilhorighetStemmekrets.getCurrentOppdaterteKontekstEgenskaper();
    if (oppdaterteGrunnkretsTilhorigheter != null && oppdaterteStemmekretsTilhorigheter != null) {
      addKontekstEntryFromFeature(
        feature as Feature<LineString>,
        [...oppdaterteGrunnkretsTilhorigheter, ...oppdaterteStemmekretsTilhorigheter],
        addHistoryEntry,
      );
    }
  };

  const resetAll = () => {
    useTilhorighetGrunnkrets.resetTilhorighet();
    useTilhorighetStemmekrets.resetTilhorighet();
  };

  const handleSubmit = () => {
    if (isDirty && isValid) {
      setIsSubmitted(true);
      submitAll();
    } else setIsSubmitted(false);
  };

  return (
    <>
      <TilhorighetFieldHeader>
        <Text as={"b"} fontSize={"lg"}>
          Tilhørighet
        </Text>
        <EditGrenseInfoButton
          isEditing={isEditing}
          handleSubmit={handleSubmit}
          toggleEdit={() =>
            setIsEditing((prevState) => {
              if (isEditing && !isDirty) {
                resetAll();
                setIsSubmitted(false);
              }
              return !prevState;
            })
          }
        />
      </TilhorighetFieldHeader>
      <TilhorighetRow
        isEditing={isEditing}
        isSubmitted={isSubmitted}
        isValid={isValid}
        feature={feature}
        useTilhorighet={useTilhorighetGrunnkrets}
        isDisabled={true}
      />
      <TilhorighetRow
        isEditing={isEditing}
        isSubmitted={isSubmitted}
        isValid={isValid}
        feature={feature}
        useTilhorighet={useTilhorighetStemmekrets}
        isDisabled={true}
      />
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

const TilhorighetFieldHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
