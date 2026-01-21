import { Stack, Text } from "@kvib/react";
import EditAndSaveButton from "components/EditAndSaveButton";
import { KretsType } from "components/Endringslogg/hooks/utkastEndringerTypes";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { useUtkast } from "contexts/UtkastContext/UtkastContext";
import { Feature } from "ol";
import { Geometry, LineString } from "ol/geom";
import { TilhorighetSearch } from "pages/Kart/OverlayPanels/GrenseinformasjonPanel/TilhorighetSearch";
import { isTempFeatureId } from "pages/Kart/interactions/feature-id-utils";
import { useEffect, useState } from "react";
import { styled } from "styled-components";
import { FeatureProperties } from "types/api";
import { isAdministrativGrense, isBopliktGrense, isFylkesGrense, isKommuneGrense } from "utils/grenser";
import { capitalize } from "utils/string-utils";
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

type TilhorighetRowProps = {
  feature: Feature;
  useTilhorighet: UseTilhorighet;
  isValid: boolean;
  isSubmitted: boolean;
  isEditing: boolean;
};

const TilhorighetRow = ({
  feature,
  useTilhorighet: { kretsType, tilhorighetOptions, formState, setValue, isLoading },
  isSubmitted,
  isValid,
  isEditing,
}: TilhorighetRowProps) => {
  return (
    <GrenseinformasjonRowTilhorighet
      isEditing={isEditing}
      isSubmitted={isSubmitted}
      name={capitalize(kretsType.toLocaleLowerCase()) + "er"}
      valueLabel={
        getTilhorighetValuesFormatted(formState[kretsType], tilhorighetOptions) ??
        (isTempFeatureId(feature.getId()?.toString()) ? "Ny grense - Mangler tilhørighet" : undefined)
      }
      isValid={isValid}
      isLoading={isLoading}
      tooltipLabel={`
      Definerer hvilke ${kretsType.toLocaleLowerCase()}er grensen har på hver sin side.
      `}
    >
      <Stack>
        {Object.values(Tilhorighet).map((tilhorighet) => (
          <div key={tilhorighet}>
            <TilhorighetSearch
              value={formState[kretsType][tilhorighet]}
              kretsType={kretsType}
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

const TilhorighetRowEnkel = ({
  feature,
  useTilhorighet: { kretsType, tilhorighetOptions, formState, setValue, isLoading },
  isSubmitted,
  isValid,
  isEditing,
}: TilhorighetRowProps) => {
  return (
    <GrenseinformasjonRowTilhorighet
      isEditing={isEditing}
      isSubmitted={isSubmitted}
      name={capitalize(kretsType.toLocaleLowerCase())}
      valueLabel={
        getLandgrenseTilhorighetValueFormatted(formState[kretsType], tilhorighetOptions) ??
        (isTempFeatureId(feature.getId()?.toString()) ? "Ny grense - Mangler tilhørighet" : undefined)
      }
      isValid={isValid}
      isLoading={isLoading}
      tooltipLabel={`
      Definerer hvilket ${kretsType.toLocaleLowerCase()} grensen hører til.
      `}
    >
      <TilhorighetSearch
        value={formState[kretsType][Tilhorighet.A]}
        kretsType={kretsType}
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
  const { addHistoryEntry } = useHistory();

  const isLoading = tilhorighetForm?.isLoading ?? false;

  const isValid =
    tilhorighetForm?.formState[tilhorighetForm.kretsType][Tilhorighet.A] != null &&
    tilhorighetForm?.formState[tilhorighetForm.kretsType][Tilhorighet.B] != null;

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
      renderChildren={({ isEditing, isSubmitted, isValid }) => (
        <TilhorighetRow
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
  const useTilhorighetGrunnkrets = useAdministrativTilhorighet(feature, KretsType.GRUNNKRETS);
  const useTilhorighetStemmekrets = useAdministrativTilhorighet(feature, KretsType.STEMMEKRETS);

  return (
    <>
      <TilhorighetFieldController
        feature={feature}
        isDisabled={isDisabled}
        tooltip={tooltip}
        tilhorighetForm={useTilhorighetGrunnkrets}
        renderChildren={({ isEditing, isSubmitted, isValid }) => (
          <TilhorighetRow
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
        renderChildren={({ isEditing, isSubmitted, isValid }) => (
          <TilhorighetRow
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
  const useTilhorighetGrunnkrets = useAdministrativTilhorighet(feature, KretsType.GRUNNKRETS);
  const useTilhorighetStemmekrets = useAdministrativTilhorighet(feature, KretsType.STEMMEKRETS);
  return (
    <>
      <TilhorighetFieldController
        feature={feature}
        isDisabled={isDisabled}
        tooltip={tooltip}
        tilhorighetForm={useTilhorighetGrunnkrets}
        renderChildren={({ isEditing, isSubmitted, isValid }) => (
          <TilhorighetRowEnkel
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
        renderChildren={({ isEditing, isSubmitted, isValid }) => (
          <TilhorighetRowEnkel
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
      renderChildren={({ isEditing, isSubmitted, isValid }) => (
        <TilhorighetRowEnkel
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
