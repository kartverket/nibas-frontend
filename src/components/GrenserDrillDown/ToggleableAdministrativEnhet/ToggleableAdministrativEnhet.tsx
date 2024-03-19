import { useEditGrenseValue } from "contexts/EditGrenserContext/EditGrenserContext";
import { useEffect, useMemo } from "react";
import { AdministrativEnhetResponse } from "types/api";
import { getIdFromEntity } from "utils/api";
import { getNavnInSpraak } from "utils/language/language";
import { getFeatureFromGeoJson } from "utils/map/geoJson";
import { getRepresentasjonspunktId } from "utils/map/source";
import { Outline } from "style/mixins";
import useApiGrense from "./useApiGrense";
import { useEditGrense } from "contexts/EditGrenserContext/useEditGrense";
import { styled } from "styled-components";
import { IconButton, Spinner } from "@kvib/react";

type Props = {
  administrativEnhet: AdministrativEnhetResponse;
  type: "fylke" | "kommune";
  featuresUrl: string;
};

const getAdministrativEnhetNummer = (enhet: AdministrativEnhetResponse): string | null => {
  if ("fylkesnummer" in enhet) {
    return enhet.fylkesnummer.kodeverdi;
  }
  if ("kommunenummer" in enhet) {
    return enhet.kommunenummer.kodeverdi;
  }
  return null;
};

export const getRepresentasjonspunktFeatureForAdministrativEnhet = (administrativEnhet: AdministrativEnhetResponse) => {
  return getFeatureFromGeoJson({
    ...administrativEnhet.representasjonspunkt,
    id: getRepresentasjonspunktId(administrativEnhet.id.lokalid.value),
    properties: {
      ...administrativEnhet.representasjonspunkt.properties,
      name: getNavnInSpraak(administrativEnhet.navn, "nor"),
      number: getAdministrativEnhetNummer(administrativEnhet),
    },
  });
};

const ToggleableAdministrativEnhet = ({ administrativEnhet, type, featuresUrl }: Props) => {
  const adminEnhetId = getIdFromEntity(administrativEnhet);
  const { isVisible, isEditing } = useEditGrenseValue(type, adminEnhetId);
  const { features, fetchFeatures } = useApiGrense(type, featuresUrl, isEditing || isVisible);
  const memoizedFeatures = useMemo(() => {
    if (!features) {
      return null;
    }

    const representasjonspunktFeatures = getRepresentasjonspunktFeatureForAdministrativEnhet(administrativEnhet);

    return features.concat(representasjonspunktFeatures);
  }, [features, administrativEnhet]);
  const { kretsStatus, toggleVisible, isLoading } = useEditGrense(
    type,
    getIdFromEntity(administrativEnhet),
    memoizedFeatures,
  );

  useEffect(() => {
    features?.forEach((feature) => {
      feature.setProperties({
        ...feature.getProperties(),
        inndelingerKontekst: {
          id: adminEnhetId,
          type,
        },
      });
    });
  }, [features, adminEnhetId, type]);

  useEffect(() => {
    if (features || isVisible === false) return;

    fetchFeatures();
  }, [isVisible, features, fetchFeatures]);

  return (
    <Wrapper $isVisible={kretsStatus.isVisible ? true : false}>
      <IconButton
        onClick={toggleVisible}
        aria-label={kretsStatus.isVisible ? "Synlig" : "Usynlig"}
        icon={kretsStatus.isVisible ? "visibility" : "visibility_off"}
      />
      <Title>{`${getAdministrativEnhetNummer(administrativEnhet)} ${getNavnInSpraak(
        administrativEnhet.navn,
        "nor",
      )}`}</Title>
      {isLoading && <Spinner size="lg" color="var(--kvib-colors-blue-500)" />}
    </Wrapper>
  );
};

export default ToggleableAdministrativEnhet;

const Title = styled.div`
  flex: 1;
  margin-left: 8px;
  user-select: none;
`;

const Wrapper = styled.div<{ $isVisible: boolean }>`
  display: flex;
  align-items: center;
  margin: 16px 0 0 24px;

  > :first-child {
    color: ${({ $isVisible }) =>
      $isVisible ? "var(--kvib-colors-chakra-inverse-text)" : "var(--kvib-colors-blue-500)"};
    padding: 8px;
    border-radius: 50%;
    background: ${({ $isVisible }) => ($isVisible ? "var(--kvib-colors-blue-500)" : "transparent")};

    &:hover {
      background: var(--kvib-colors-blue-50);
      color: var(--kvib-colors-blue-500);
    }

    &:focus-visible {
      ${Outline}
    }
  }
`;
