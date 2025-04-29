import { Stack, Text } from "@kvib/react";
import EditAndSaveButton from "components/EditAndSaveButton";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { useUtkast } from "contexts/UtkastContext/UtkastContext";
import { Feature } from "ol";
import { Geometry, LineString } from "ol/geom";
import { TilhorighetSearch } from "pages/Kart/OverlayPanels/GrenseinformasjonPanel/TilhorighetSearch";
import { isTempFeatureId } from "pages/Kart/interactions/feature-id-utils";
import { useEffect, useState } from "react";
import { styled } from "styled-components";
import { FeatureProperties } from "types/api";
import { isAdministrativGrense, isFylkesGrense, isKommuneGrense } from "utils/grenser";
import { capitalize } from "utils/string-utils";
import { isGrenseType } from "utils/type-utils";
import {
  CustomOption,
  KontekstType,
  Tilhorighet,
  TilhorighetChoice,
  TilhorighetOptions,
  UseTilhorighet,
  formatKretsNavn,
  getKontekstTypeForFeature,
} from "../hooks/tilhorighet-utils";
import { useAdministrativTilhorighet } from "../hooks/useAdministrativTilhorighet";
import { useTilhorighet } from "../hooks/useTilhorighet";
import GrenseinformasjonRowTilhorighet from "./GrenseinformasjonRowTilhorighet";
import { addKontekstEntryFromFeature } from "./grenseinformasjon-utils";

type TilhorighetRowProps = {
  feature: Feature;
  useTilhorighet: UseTilhorighet;
  isValid: boolean;
  isSubmitted: boolean;
  isEditing: boolean;
};

const TilhorighetRow = ({
  feature,
  useTilhorighet: { kontekstType, tilhorighetOptions, formState, setValue, isLoading },
  isSubmitted,
  isValid,
  isEditing,
}: TilhorighetRowProps) => {
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

const TilhorighetRowLandgrense = ({
  feature,
  useTilhorighet: { kontekstType, tilhorighetOptions, formState, setValue, isLoading },
  isSubmitted,
  isValid,
  isEditing,
}: TilhorighetRowProps) => {
  return (
    <GrenseinformasjonRowTilhorighet
      isEditing={isEditing}
      isSubmitted={isSubmitted}
      name={capitalize(kontekstType.toLocaleLowerCase())}
      valueLabel={
        getLandgrenseTilhorighetValueFormatted(formState[kontekstType], tilhorighetOptions) ??
        (isTempFeatureId(feature.getId()?.toString()) ? "Ny grense - Mangler tilhørighet" : undefined)
      }
      isValid={isValid}
      isLoading={isLoading}
      tooltipLabel={`
      Definerer hvilken ${kontekstType.toLocaleLowerCase()} grensen har på sin norske side. Obs! Endring av dette feltet impliserer geometriendringer.
      `}
    >
      <TilhorighetSearch
        value={formState[kontekstType][Tilhorighet.A]}
        kretsType={kontekstType}
        onChange={(newValue) => setValue(Tilhorighet.A, newValue)}
        options={
          tilhorighetOptions?.[Tilhorighet.A]?.map((krets) => ({
            value: krets.id.lokalid.value,
            label: formatKretsNavn(krets),
          })) ?? []
        }
      />
    </GrenseinformasjonRowTilhorighet>
  );
};

type ParentPassedProps = Pick<TilhorighetRowProps, "isEditing" | "isSubmitted"> & {
  isStemmekretserValid: boolean;
  isGrunnkretserValid: boolean;
};
type TilhorighetFieldControllerProps = {
  feature: Feature<Geometry>;
  isDisabled?: boolean;
  tooltip?: string;
  grunnkretsTilhorighetForm: UseTilhorighet | null;
  stemmekretsTilhorighetForm: UseTilhorighet | null;
  renderChildren: (props: ParentPassedProps) => React.ReactNode;
};

const TilhorighetFieldController = ({
  feature,
  isDisabled,
  tooltip,
  grunnkretsTilhorighetForm,
  stemmekretsTilhorighetForm,
  renderChildren,
}: TilhorighetFieldControllerProps) => {
  const { addHistoryEntry } = useHistory();

  const isLoading = (grunnkretsTilhorighetForm?.isLoading ?? false) || (stemmekretsTilhorighetForm?.isLoading ?? false);

  const isGrunnkretserValid =
    grunnkretsTilhorighetForm?.formState[KontekstType.GRUNNKRETS][Tilhorighet.A] != null &&
    grunnkretsTilhorighetForm?.formState[KontekstType.GRUNNKRETS][Tilhorighet.B] != null;
  const isStemmekretserValid =
    stemmekretsTilhorighetForm?.formState[KontekstType.STEMMEKRETS][Tilhorighet.A] != null &&
    stemmekretsTilhorighetForm?.formState[KontekstType.STEMMEKRETS][Tilhorighet.B] != null;

  const isAllValid =
    (stemmekretsTilhorighetForm != null ? isStemmekretserValid : true) &&
    (grunnkretsTilhorighetForm != null ? isGrunnkretserValid : true);

  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const submit = () => {
    const oppdaterteGrunnkretsKontekster = grunnkretsTilhorighetForm?.getCurrentOppdaterteKontekstEgenskaper() ?? [];
    const oppdaterteStemmekretsKontekster = stemmekretsTilhorighetForm?.getCurrentOppdaterteKontekstEgenskaper() ?? [];

    // Vi ønsker ikke å sende med NOT_CHOSEN kontekstegenskaper. Hvis det er feil antall håndteres dette i backend.
    addKontekstEntryFromFeature(
      feature as Feature<LineString>,
      [...oppdaterteGrunnkretsKontekster, ...oppdaterteStemmekretsKontekster].filter(
        (ke) => ke.id?.lokalid.value !== CustomOption.NOT_CHOSEN,
      ),
      addHistoryEntry,
    );
  };

  const isDirty =
    (grunnkretsTilhorighetForm != null ? grunnkretsTilhorighetForm.isDirty : false) ||
    (stemmekretsTilhorighetForm != null ? stemmekretsTilhorighetForm.isDirty : false);

  const reset = () => {
    grunnkretsTilhorighetForm?.resetTilhorighet();
    stemmekretsTilhorighetForm?.resetTilhorighet();
  };

  useEffect(() => {
    setIsEditing(false);
  }, [feature]);

  const handleSubmit = () => {
    setIsSubmitted(true);
    if (isDirty && isAllValid) {
      submit();
      setIsEditing(false);
    }
    if (!isDirty) {
      setIsEditing(false);
    }
  };

  return (
    <>
      <TilhorighetFieldHeader>
        <Text as={"b"} fontSize={"lg"}>
          Tilhørighet
        </Text>
        <EditAndSaveButton
          isEditing={isEditing}
          isDisabled={isDisabled === true || isLoading === true}
          tooltip={tooltip}
          tooltipPlacement="left"
          size="sm"
          onSubmit={handleSubmit}
          variant="secondary"
          toggleEditing={() =>
            setIsEditing((prevState) => {
              setIsSubmitted(false);
              if (isEditing) {
                reset();
              }
              return !prevState;
            })
          }
        >
          Rediger
        </EditAndSaveButton>
      </TilhorighetFieldHeader>
      {renderChildren({
        isEditing,
        isSubmitted,
        isGrunnkretserValid,
        isStemmekretserValid,
      })}
    </>
  );
};

type TilhorighetProps = {
  feature: Feature<Geometry>;
  isDisabled?: boolean;
  tooltip?: string;
};

const CommonTilhorighetField = ({ feature, isDisabled, tooltip }: TilhorighetProps) => {
  const commonTilhorighet = useTilhorighet(feature);
  const featureProperties = feature.getProperties() as FeatureProperties;
  const kontekstType = getKontekstTypeForFeature(featureProperties.kontekstEgenskaper, featureProperties);

  return (
    <TilhorighetFieldController
      feature={feature}
      isDisabled={isDisabled}
      tooltip={tooltip}
      grunnkretsTilhorighetForm={kontekstType === KontekstType.GRUNNKRETS ? commonTilhorighet : null}
      stemmekretsTilhorighetForm={kontekstType === KontekstType.STEMMEKRETS ? commonTilhorighet : null}
      renderChildren={({ isEditing, isSubmitted, isGrunnkretserValid, isStemmekretserValid }) => (
        <TilhorighetRow
          isEditing={isEditing}
          isSubmitted={isSubmitted}
          isValid={kontekstType === KontekstType.GRUNNKRETS ? isGrunnkretserValid : isStemmekretserValid}
          feature={feature}
          useTilhorighet={commonTilhorighet}
        />
      )}
    ></TilhorighetFieldController>
  );
};

const AdministrativTilhorighetField = ({ feature, isDisabled, tooltip }: TilhorighetProps) => {
  const useTilhorighetGrunnkrets = useAdministrativTilhorighet(feature, KontekstType.GRUNNKRETS);
  const useTilhorighetStemmekrets = useAdministrativTilhorighet(feature, KontekstType.STEMMEKRETS);

  return (
    <TilhorighetFieldController
      feature={feature}
      isDisabled={isDisabled}
      tooltip={tooltip}
      grunnkretsTilhorighetForm={useTilhorighetGrunnkrets}
      stemmekretsTilhorighetForm={useTilhorighetStemmekrets}
      renderChildren={({ isEditing, isSubmitted, isGrunnkretserValid, isStemmekretserValid }) => (
        <>
          <TilhorighetRow
            isEditing={isEditing}
            isSubmitted={isSubmitted}
            isValid={isGrunnkretserValid}
            feature={feature}
            useTilhorighet={useTilhorighetGrunnkrets}
          />
          <TilhorighetRow
            isEditing={isEditing}
            isSubmitted={isSubmitted}
            isValid={isStemmekretserValid}
            feature={feature}
            useTilhorighet={useTilhorighetStemmekrets}
          />
        </>
      )}
    />
  );
};

const LandgrenseTilhørighetField = ({ feature, isDisabled, tooltip }: TilhorighetProps) => {
  const useTilhorighetGrunnkrets = useAdministrativTilhorighet(feature, KontekstType.GRUNNKRETS);
  const useTilhorighetStemmekrets = useAdministrativTilhorighet(feature, KontekstType.STEMMEKRETS);
  return (
    <TilhorighetFieldController
      feature={feature}
      isDisabled={isDisabled}
      tooltip={tooltip}
      grunnkretsTilhorighetForm={useTilhorighetGrunnkrets}
      stemmekretsTilhorighetForm={useTilhorighetStemmekrets}
      renderChildren={({ isEditing, isSubmitted, isGrunnkretserValid, isStemmekretserValid }) => (
        <>
          <TilhorighetRowLandgrense
            isEditing={isEditing}
            isSubmitted={isSubmitted}
            isValid={isGrunnkretserValid}
            feature={feature}
            useTilhorighet={useTilhorighetGrunnkrets}
          />
          <TilhorighetRowLandgrense
            isEditing={isEditing}
            isSubmitted={isSubmitted}
            isValid={isStemmekretserValid}
            feature={feature}
            useTilhorighet={useTilhorighetStemmekrets}
          />
        </>
      )}
    />
  );
};

export const TilhorighetField = ({ feature, isDisabled = false }: TilhorighetProps) => {
  const featureProperties = feature.getProperties() as FeatureProperties;
  const featureType = featureProperties.type;
  const utkastHarSammenslaainger = useUtkast().utkastHarSammenslaainger;
  const tooltip =
    utkastHarSammenslaainger() === true
      ? "Utkastet har sammenslåinger og tilhørighet kan derfor ikke redigeres."
      : undefined;

  if (isGrenseType(featureType) && (isKommuneGrense(featureType) || isFylkesGrense(featureType))) {
    return <AdministrativTilhorighetField feature={feature} isDisabled={isDisabled} tooltip={tooltip} />;
  } else if (isGrenseType(featureType) && isAdministrativGrense(featureType)) {
    return <LandgrenseTilhørighetField feature={feature} isDisabled={isDisabled} tooltip={tooltip} />;
  }
  return <CommonTilhorighetField feature={feature} isDisabled={isDisabled} tooltip={tooltip} />;
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

const getLandgrenseTilhorighetValueFormatted = (
  formState: TilhorighetChoice,
  tilhorighetOptions: TilhorighetOptions | null | undefined,
) => {
  if (formState.a != null && tilhorighetOptions) {
    const kretsA = tilhorighetOptions[Tilhorighet.A].find(
      (krets) => krets.id.lokalid.value === formState[Tilhorighet.A],
    );

    if (!kretsA) {
      return undefined;
    } else {
      return <Text>{formatKretsNavn(kretsA)}</Text>;
    }
  }
};

const TilhorighetFieldHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
