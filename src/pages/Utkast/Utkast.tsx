import { Heading, Icon, Link, SkeletonText } from "@kvib/react";
import AlertModal from "components/Modals/AlertModal";
import { Page, PageContainer } from "components/Page";
import { useErrorHandling } from "contexts/ErrorHandlingContext";
import { useUtkasts } from "hooks/inndelinger/useUtkasts";
import useMapReset from "hooks/useMapReset";
import LandingHeader from "pages/Landing/LandingHeader";
import PrivacyFooter from "pages/Landing/PrivacyFooter";
import { useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { styled } from "styled-components";
import { UtkastResponse } from "types/api";
import { routes } from "utils/routes";
import UtkastCard from "./UtkastCard";
import UtkastOpprett from "./UtkastOpprett";

type UtkastGroup = Record<UtkastResponse["endringstype"], UtkastResponse[]>;

const sortUtkastByCreatedDesc = (a: UtkastResponse, b: UtkastResponse): number =>
  b.opprettetDato.localeCompare(a.opprettetDato);

const Utkast = () => {
  const { error, setError } = useErrorHandling();
  const { data: utkasts, isLoading } = useUtkasts();
  const resetMap = useMapReset();

  useEffect(() => {
    resetMap();
  }, [resetMap]);

  // Vi deler opp utkast i to kolonner manuelt i et forsøk på å holde lengden jevn
  const rightColumn: UtkastGroup = {
    Fastsetting: [],
    Kvalitetsheving: [],
    Navneendring: [],
    Nummerendring: [],
    Retting: [],
  };

  const leftColumn: UtkastGroup = {
    "Vedtatt grensejustering": [],
    "Vedtatt sammenslåing": [],
    "Vedtatt deling": [],
  };

  // Grupperer utkast etter endringstype
  for (const utkast of utkasts ?? []) {
    if (utkast.endringstype in leftColumn) {
      leftColumn[utkast.endringstype] = [...leftColumn[utkast.endringstype], utkast];
    } else if (utkast.endringstype in rightColumn) {
      rightColumn[utkast.endringstype] = [...rightColumn[utkast.endringstype], utkast];
    }
  }

  return (
    <PageContainer>
      <LandingHeader />
      <UtkastPage>
        <TitleContainer>
          <ReturnButton to={routes.index}>
            <Icon icon="arrow_back" />
            <span>Tilbake til forsiden</span>
          </ReturnButton>
          <Heading as="h1" size="lg">
            Upubliserte utkast
          </Heading>
          <UtkastOpprett />
        </TitleContainer>
        {[leftColumn, rightColumn].map((column, i) => (
          <EndringstypeList key={i}>
            {isLoading && (
              <EndringstypeGroup>
                <Heading size="md">Henter utkast...</Heading>
                <LoadingSkeleton />
                <LoadingSkeleton />
              </EndringstypeGroup>
            )}
            {Object.entries(column)
              .sort()
              .map(([endringstype, utkastsInGroup]) => (
                <EndringstypeGroup key={endringstype}>
                  <Heading size="md">{endringstype}</Heading>
                  {utkastsInGroup.length > 0 ? (
                    utkastsInGroup.sort(sortUtkastByCreatedDesc).map((u) => <UtkastCard key={u.id} utkast={u} />)
                  ) : (
                    <IngenUtkastText>Det finnes ingen utkast av denne utkasttypen.</IngenUtkastText>
                  )}
                </EndringstypeGroup>
              ))}
          </EndringstypeList>
        ))}
      </UtkastPage>
      {error && (
        <AlertModal
          status="error"
          title={error.title}
          description={error.description}
          additionalInfo={error.additionalInfo}
          errorCode={error.errorCode}
          isOpen={true}
          onClose={() => setError(null)}
          primaryAction={{
            text: "Lukk",
            onClick: () => setError(null),
          }}
        />
      )}
      <PrivacyFooter />
    </PageContainer>
  );
};

const UtkastPage = styled(Page)`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto 1fr;
  grid-template-areas:
    "title title"
    "left right";
  justify-items: unset;
  gap: 48px;
  padding: 64px;
`;

const TitleContainer = styled.div`
  display: grid;
  grid-template-columns: auto auto;
  justify-items: start;
  gap: 12px 24px;
  grid-area: title;
  width: fit-content;
`;

const LoadingSkeleton = styled(SkeletonText)`
  padding: 24px;
  border-radius: 8px;
  background: var(--kvib-colors-chakra-body-bg);
  box-shadow: var(--kvib-shadows-sm);
  cursor: not-allowed;
`;

const EndringstypeList = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 48px;
`;

const EndringstypeGroup = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const IngenUtkastText = styled.p`
  color: var(--kvib-colors-gray-500);
  font-size: var(--kvib-fontSizes-sm);
`;

const ReturnButton = styled(Link).attrs({ as: RouterLink })`
  display: flex;
  gap: 4px;
  align-items: center;
  grid-column: 1 / -1;
  align-self: start;
  color: var(--kvib-colors-blue-500);

  & > .material-symbols-rounded {
    font-size: 20px;
    transition: transform 0.2s;
  }

  &:hover {
    & > .material-symbols-rounded {
      transform: translateX(-4px);
    }

    & > span:last-child {
      text-decoration: underline;
    }
  }
`;

export default Utkast;
