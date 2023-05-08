import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { AuthenticationButton } from "../Authentication/AuthenticationButton";
import Logo from "components/Logo/Logo";
import Icon from "components/Icon";
import UtkastTab from "./UtkastTab";

const TopBar = () => {
  const { isAuthenticatedFunc, tokenHolderFunc } = useAuthenticationFlow();

  const { t } = useTranslation();

  return (
    <Wrapper>
      <LeftSide>
        <Logo />
        <Sidetittel>{t("Nasjonal inndelingsbase")}</Sidetittel>
        <UtkastTab />
      </LeftSide>
      <RightSide>
        <LoginIcon icon="person" filled />
        {isAuthenticatedFunc() ? (
          <LoginText>
            {t(`auth.Logget inn som {{ personId }}`, {
              personId: tokenHolderFunc()?.personId,
            })}
          </LoginText>
        ) : (
          <LoginText>{t("auth.Ikke logget inn")}</LoginText>
        )}
        <AuthenticationButton />
      </RightSide>
    </Wrapper>
  );
};

const Sidetittel = styled.h1`
  padding: 0;
  margin: 0;
  font-size: 1rem;
  font-weight: 300;
`;

const Wrapper = styled.div`
  grid-area: topbar;
  display: flex;
  padding: 14px 16px;
  padding-left: 0;
`;

const LeftSide = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex: 1;

  & > * + * {
    margin-top: 1rem;
  }
`;

const RightSide = styled.div`
  display: flex;
  align-items: center;
`;

const LoginText = styled.p`
  margin-right: 1rem;
`;

const LoginIcon = styled(Icon)`
  color: var(--blue_dark);
  margin-right: 8px;
`;

export default TopBar;
