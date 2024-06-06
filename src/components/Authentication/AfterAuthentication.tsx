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

const getUtkastIdFromUser = (user?: User | null): string | null => {
  if (user?.state == null) return null;

  if (user.state instanceof Object && "utkastId" in user.state && typeof user.state.utkastId === "string") {
    return user.state.utkastId;
  }
  return null;
};

export const AfterAuthentication = () => {
  const { isAuthenticated, isLoading, checkAuthorization, hasError, token, user } = useAuthentication();
  const navigate = useNavigate();

  useEffect(() => {
    const utkastId = getUtkastIdFromUser(user);

    if (isAuthenticated && !isLoading) {
      checkAuthorization().then((result) => {
        if (result != null && utkastId != null) {
          navigate(`${routes.utkast}/${utkastId}`, { replace: true });
        } else if (result != null) {
          navigate(routes.index, { replace: true });
        } else {
          navigate(`${routes.authentication}/${routes.notAuthorized}`, { replace: true });
        }
      });
    }
  }, [isAuthenticated, isLoading, checkAuthorization, navigate, user, token]);

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

const AuthenticationPage = styled(Page)`
  gap: 48px;
`;
