import { styled } from "styled-components";
import { Page } from "components/Page";
import { Logo, Spinner, Text } from "@kvib/react";
import PrivacyFooter from "pages/Landing/PrivacyFooter";
import { Navigate, useNavigate } from "react-router-dom";
import { routes } from "utils/routes";
import { useAuthentication } from "components/Authentication/AuthenticationHook";
import { useEffect } from "react";
import { User } from "oidc-client-ts";
import { useInndelinger } from "contexts/InndelingerContext/InndelingerContext";
import { fetchInndelingFromSessionStorage } from "contexts/application-state-utils";
import { featureEnabled } from "components/FeatureToggle";
import Providers from "pages/App/Providers";

const getUtkastIdFromUser = (user?: User | null): string | null => {
  if (user?.state == null) return null;

  if (user.state instanceof Object && "utkastId" in user.state && typeof user.state.utkastId === "string") {
    return user.state.utkastId;
  }
  return null;
};

const AfterAuthenticationBody = () => {
  const { isAuthenticated, isLoading, checkAuthorization, hasError, token, user } = useAuthentication();
  const navigate = useNavigate();
  const { selectInndelinger, setSelectedFylkeId } = useInndelinger();

  useEffect(() => {
    const utkastId = getUtkastIdFromUser(user);

    if (isAuthenticated && !isLoading) {
      checkAuthorization().then((result) => {
        // Her har vi blitt sendt tilbake etter et utgått refresh token
        if (result != null && utkastId != null) {
          navigate(`${routes.utkast}/${utkastId}`, { replace: true });

          if (featureEnabled("SAVE_STATE_ON_REAUTH")) {
            const selectedInndelingerFromSessionStorage = fetchInndelingFromSessionStorage();
            if (selectedInndelingerFromSessionStorage != null) {
              selectInndelinger(selectedInndelingerFromSessionStorage.inndelinger);
              setSelectedFylkeId(selectedInndelingerFromSessionStorage.selectedFylkeId);
              if (user?.state != null && user.state instanceof Object && "utkastId" in user.state) {
                user.state.utkastId = undefined;
              }
            }
          }
        } else if (result != null) {
          navigate(routes.index, { replace: true });
        } else {
          navigate(`${routes.authentication}/${routes.notAuthorized}`, { replace: true });
        }
      });
    }
  }, [isAuthenticated, isLoading, checkAuthorization, navigate, user, token, selectInndelinger, setSelectedFylkeId]);

  if (hasError) {
    return <Navigate to={`${routes.authentication}/${routes.authError}`} replace={true} />;
  }

  if (!isLoading && !isAuthenticated) {
    return <Navigate to={`${routes.authentication}/${routes.authError}`} replace={true} />;
  }

  return (
    <AuthenticationPage>
      <Logo />
      <Spinner size="xl" color="var(--kvib-colors-blue-500)" />
      <Text>Vennligst vent, du blir logget inn...</Text>
      <PrivacyFooter />
    </AuthenticationPage>
  );
};

export const AfterAuthentication = () => {
  return (
    <Providers>
      <AfterAuthenticationBody />
    </Providers>
  );
};

const AuthenticationPage = styled(Page)`
  gap: 48px;
`;
