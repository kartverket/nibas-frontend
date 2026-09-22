import { Stack, Text } from "@kvib/react";
import EditAndSaveButton from "components/EditAndSaveButton";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { useUtkast } from "contexts/UtkastContext/UtkastContext";
import { Feature } from "ol";
import { Geometry, LineString } from "ol/geom";
import { OptionType, TilhorighetSearch } from "pages/Kart/OverlayPanels/GrenseinformasjonPanel/TilhorighetSearch";
import { inndelingIsArchived } from "pages/Kart/interactions/archive-features";
import { isTempFeatureId } from "pages/Kart/interactions/feature-id-utils";
import { useEffect, useState } from "react";
import { styled } from "styled-components";
import { FeatureProperties } from "types/api";
import { isAdministrativGrense, isBopliktGrense, isFylkesGrense, isKommuneGrense } from "utils/grenser";
import { isGrenseType } from "utils/type-utils";
import {
  CustomOption,
  Tilhorighet,
  TilhorighetChoice,
  TilhorighetOptions,
  UseTilhorighet,
  formatKretsNavn,
} from "../hooks/tilhorighet-utils";
import { useAdministrativTilhorighet } from "../hooks/useAdministrativTilhorighet";
import { useTilhorighet } from "../hooks/useTilhorighet";
import GrenseinformasjonRowTilhorighet from "./GrenseinformasjonRowTilhorighet";
import { addKontekstEntryFromFeature } from "./grenseinformasjon-utils";
import { getInndelingtypeLabel } from "utils/inndelinger-utils";

type TilhorighetRowProps = {
  feature: Feature;
  useTilhorighet: UseTilhorighet;
  selectableOptions: TilhorighetOptions | undefined;
  isValid: boolean;
  isSubmitted: boolean;
  isEditing: boolean;
};

const getOptions = (
  tilhorighetOptions: TilhorighetOptions | undefined,
  selectableOptions: TilhorighetOptions | undefined,
  tilhorighet: Tilhorighet,
) => {
  const options: OptionType[] =
    tilhorighetOptions?.[tilhorighet]?.map((krets) => ({
      value: krets.id.lokalid.value,
      label: formatKretsNavn(krets),
    })) ?? [];
  const mappedSelectableOptions: OptionType[] =
    selectableOptions?.[tilhorighet]?.map((krets) => ({
      value: krets.id.lokalid.value,
      label: formatKretsNavn(krets),
    })) ?? [];
  return { options, selectableOptions: mappedSelectableOptions };
};

const TilhorighetRow = ({
  feature,
  useTilhorighet: { inndelingType, tilhorighetOptions, formState, setValue, isLoading },
  selectableOptions,
  isSubmitted,
  isValid,
  isEditing,
}: TilhorighetRowProps) => {
  return (
    <GrenseinformasjonRowTilhorighet
      isEditing={isEditing}
      isSubmitted={isSubmitted}
      name={getInndelingtypeLabel(inndelingType, { pluralizeLabel: true, capitalizeLabel: true })}
      valueLabel={
        getTilhorighetValuesFormatted(formState[inndelingType], tilhorighetOptions) ??
        (isTempFeatureId(feature.getId()?.toString()) ? "Ny grense - Mangler tilhørighet" : undefined)
      }
      isValid={isValid}
      isLoading={isLoading}
      tooltipLabel={`
      Definerer hvilke ${getInndelingtypeLabel(inndelingType, { pluralizeLabel: true, capitalizeLabel: false })} grensen har på hver sin side.
      `}
    >
      <Stack>
        {Object.values(Tilhorighet).map((tilhorighet) => (
          <TilhorighetSearch
            key={tilhorighet}
            value={formState[inndelingType][tilhorighet]}
            inndelingType={inndelingType}
            onChange={(newValue) => setValue(tilhorighet, newValue)}
            {...getOptions(tilhorighetOptions, selectableOptions, tilhorighet)}
          />
        ))}
      </Stack>
    </GrenseinformasjonRowTilhorighet>
  );
};

const TilhorighetRowEnkel = ({
  feature,
  useTilhorighet: { inndelingType, tilhorighetOptions, formState, setValue, isLoading },
  selectableOptions,
  isSubmitted,
  isValid,
  isEditing,
}: TilhorighetRowProps) => {
  return (
    <GrenseinformasjonRowTilhorighet
      isEditing={isEditing}
      isSubmitted={isSubmitted}
      name={getInndelingtypeLabel(inndelingType, { pluralizeLabel: false, capitalizeLabel: true })}
      valueLabel={
        getLandgrenseTilhorighetValueFormatted(formState[inndelingType], tilhorighetOptions) ??
        (isTempFeatureId(feature.getId()?.toString()) ? "Ny grense - Mangler tilhørighet" : undefined)
      }
      isValid={isValid}
      isLoading={isLoading}
      tooltipLabel={`
      Definerer hvilket ${getInndelingtypeLabel(inndelingType, { pluralizeLabel: false, capitalizeLabel: false })} grensen hører til.
      `}
    >
      <TilhorighetSearch
        value={formState[inndelingType][Tilhorighet.A]}
        inndelingType={inndelingType}
        onChange={(newValue) => setValue(Tilhorighet.A, newValue)}
        {...getOptions(tilhorighetOptions, selectableOptions, Tilhorighet.A)}
      />
    </GrenseinformasjonRowTilhorighet>
  );
};

type ParentPassedProps = Pick<TilhorighetRowProps, "selectableOptions" | "isEditing" | "isSubmitted"> & {
  isValid: boolean;
};
type TilhorighetFieldControllerProps = {
  feature: Feature<Geometry>;
  isDisabled?: boolean;
  tooltip?: string;
  tilhorighetForm: UseTilhorighet | null;
  renderChildren: (props: ParentPassedProps) => React.ReactNode;
};

const TilhorighetFieldController = ({
  feature,
  isDisabled,
  tooltip,
  tilhorighetForm,
  renderChildren,
}: TilhorighetFieldControllerProps) => {
  const { addHistoryEntry, getHistoryEntries } = useHistory();
  const { utkast } = useUtkast();

  const isLoading = tilhorighetForm?.isLoading ?? false;

  const isValid =
    tilhorighetForm?.formState[tilhorighetForm.inndelingType][Tilhorighet.A] != null &&
    tilhorighetForm?.formState[tilhorighetForm.inndelingType][Tilhorighet.B] != null;
  const selectableOptions = tilhorighetForm?.tilhorighetOptions && {
    [Tilhorighet.A]: tilhorighetForm.tilhorighetOptions[Tilhorighet.A].filter(
      (krets) => !inndelingIsArchived(krets.id.lokalid.value, utkast, getHistoryEntries()),
    ),
    [Tilhorighet.B]: tilhorighetForm.tilhorighetOptions[Tilhorighet.B].filter(
      (krets) => !inndelingIsArchived(krets.id.lokalid.value, utkast, getHistoryEntries()),
    ),
  };

  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const submit = () => {
    const oppdaterteKontekster = tilhorighetForm?.getCurrentOppdaterteKontekstEgenskaper() ?? [];

    // Vi ønsker ikke å sende med NOT_CHOSEN kontekstegenskaper. Hvis det er feil antall håndteres dette i backend.
    addKontekstEntryFromFeature(
      feature as Feature<LineString>,
      [...oppdaterteKontekster].filter((ke) => ke.id?.lokalid.value !== CustomOption.NOT_CHOSEN),
      addHistoryEntry,
    );
  };

  const isDirty = tilhorighetForm?.isDirty ?? false;

  const reset = () => {
    tilhorighetForm?.resetTilhorighet();
  };

  useEffect(() => {
    setIsEditing(false);
  }, [feature]);

  const handleSubmit = () => {
    setIsSubmitted(true);
    if (isDirty && isValid) {
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
        selectableOptions,
        isEditing,
        isSubmitted,
        isValid,
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

  return (
    <TilhorighetFieldController
      feature={feature}
      isDisabled={isDisabled}
      tooltip={tooltip}
      tilhorighetForm={commonTilhorighet}
      renderChildren={({ selectableOptions, isEditing, isSubmitted, isValid }) => (
        <TilhorighetRow
          selectableOptions={selectableOptions}
          isEditing={isEditing}
          isSubmitted={isSubmitted}
          isValid={isValid}
          feature={feature}
          useTilhorighet={commonTilhorighet}
        />
      )}
    ></TilhorighetFieldController>
  );
};

const AdministrativTilhorighetField = ({ feature, isDisabled, tooltip }: TilhorighetProps) => {
  const useTilhorighetGrunnkrets = useAdministrativTilhorighet(feature, "GRUNNKRETS");
  const useTilhorighetStemmekrets = useAdministrativTilhorighet(feature, "STEMMEKRETS");

  return (
    <>
      <TilhorighetFieldController
        feature={feature}
        isDisabled={isDisabled}
        tooltip={tooltip}
        tilhorighetForm={useTilhorighetGrunnkrets}
        renderChildren={({ selectableOptions, isEditing, isSubmitted, isValid }) => (
          <TilhorighetRow
            selectableOptions={selectableOptions}
            isEditing={isEditing}
            isSubmitted={isSubmitted}
            isValid={isValid}
            feature={feature}
            useTilhorighet={useTilhorighetGrunnkrets}
          />
        )}
      />
      <TilhorighetFieldController
        feature={feature}
        isDisabled={isDisabled}
        tooltip={tooltip}
        tilhorighetForm={useTilhorighetStemmekrets}
        renderChildren={({ selectableOptions, isEditing, isSubmitted, isValid }) => (
          <TilhorighetRow
            selectableOptions={selectableOptions}
            isEditing={isEditing}
            isSubmitted={isSubmitted}
            isValid={isValid}
            feature={feature}
            useTilhorighet={useTilhorighetStemmekrets}
          />
        )}
      />
    </>
  );
};

const LandgrenseTilhørighetField = ({ feature, isDisabled, tooltip }: TilhorighetProps) => {
  const useTilhorighetGrunnkrets = useAdministrativTilhorighet(feature, "GRUNNKRETS");
  const useTilhorighetStemmekrets = useAdministrativTilhorighet(feature, "STEMMEKRETS");
  return (
    <>
      <TilhorighetFieldController
        feature={feature}
        isDisabled={isDisabled}
        tooltip={tooltip}
        tilhorighetForm={useTilhorighetGrunnkrets}
        renderChildren={({ selectableOptions, isEditing, isSubmitted, isValid }) => (
          <TilhorighetRowEnkel
            selectableOptions={selectableOptions}
            isEditing={isEditing}
            isSubmitted={isSubmitted}
            isValid={isValid}
            feature={feature}
            useTilhorighet={useTilhorighetGrunnkrets}
          />
        )}
      />
      <TilhorighetFieldController
        feature={feature}
        isDisabled={isDisabled}
        tooltip={tooltip}
        tilhorighetForm={useTilhorighetStemmekrets}
        renderChildren={({ selectableOptions, isEditing, isSubmitted, isValid }) => (
          <TilhorighetRowEnkel
            selectableOptions={selectableOptions}
            isEditing={isEditing}
            isSubmitted={isSubmitted}
            isValid={isValid}
            feature={feature}
            useTilhorighet={useTilhorighetStemmekrets}
          />
        )}
      />
    </>
  );
};

const BopliktgrenseTilhorighetField = ({ feature, isDisabled, tooltip }: TilhorighetProps) => {
  const useTilhorighetBopliktomraade = useTilhorighet(feature);
  return (
    <TilhorighetFieldController
      feature={feature}
      isDisabled={isDisabled}
      tooltip={tooltip}
      tilhorighetForm={useTilhorighetBopliktomraade}
      renderChildren={({ selectableOptions, isEditing, isSubmitted, isValid }) => (
        <TilhorighetRowEnkel
          selectableOptions={selectableOptions}
          isEditing={isEditing}
          isSubmitted={isSubmitted}
          isValid={isValid}
          feature={feature}
          useTilhorighet={useTilhorighetBopliktomraade}
        />
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
  } else if (isGrenseType(featureType) && isBopliktGrense(featureType)) {
    return <BopliktgrenseTilhorighetField feature={feature} isDisabled={isDisabled} tooltip={tooltip} />;
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
