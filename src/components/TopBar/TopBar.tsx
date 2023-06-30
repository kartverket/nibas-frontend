import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import styled from "styled-components";
import { AuthenticationButton } from "../Authentication/AuthenticationButton";
import { Logo } from "components/Logo";
import Icon from "components/Icon";
import UtkastTab from "./UtkastTab";

const TopBar = () => {
  const { isAuthenticatedFunc, tokenHolderFunc } = useAuthenticationFlow();

  return (
    <Wrapper>
      <LeftSide>
        <Logo />
        <Sidetittel>Nasjonal inndelingsbase</Sidetittel>
        <UtkastTab />
      </LeftSide>
      <RightSide>
        <LoginIcon icon="person" filled />
        {isAuthenticatedFunc() ? (
          <LoginText>
            {`Logget inn som ${tokenHolderFunc()?.personId}`}
          </LoginText>
        ) : (
          <LoginText>Du er ikke logget inn</LoginText>
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
  color: var(--kvib-colors-blue-500);
  margin-right: 8px;
`;

export default TopBar;
