import { styled } from "styled-components";
import { Page } from "components/Page";
import { Logo, Spinner, Text } from "@kvib/react";
import PrivacyFooter from "pages/Landing/PrivacyFooter";
import { useNavigate } from "react-router-dom";
import { routes } from "utils/routes";
import { useAuthentication } from "components/Authentication/AuthenticationHook";
import { useEffect } from "react";

export const AfterAuthentication = () => {
  const { isAuthenticated, isLoading, checkAuthorization, hasError } = useAuthentication();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      checkAuthorization().then((result) => {
        if (result) {
          navigate(routes.index, { replace: true });
        } else {
          navigate(`${routes.authentication}/${routes.notAutherized}`, { replace: true });
        }
      });
    }
  }, [isAuthenticated, isLoading, checkAuthorization, navigate]);

  if (hasError) {
    navigate(`${routes.authentication}/${routes.authError}`, { replace: true });
  }

  if (!isLoading && !isAuthenticated) {
    navigate(`${routes.authentication}/${routes.authError}`, { replace: true });
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
