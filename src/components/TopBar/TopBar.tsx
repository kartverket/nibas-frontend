import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { AuthenticationButton } from "../Authentication/AuthenticationButton";
import Button from "components/form/Button";
import Input from "components/form/Input";
import Logo from "components/Logo/Logo";
import { ReactComponent as SearchIcon } from "icons/search.svg";

const TopBar = () => {
  const { isAuthenticatedFunc, tokenHolderFunc } = useAuthenticationFlow();

  const { t } = useTranslation();

  return (
    <Wrapper>
      <LeftSide>
        <Logo />
        <span>{t("Nasjonal inndelingsbase")}</span>
        <SearchInput type="text" placeholder={t("Koordinater")} disabled />
        <SearchIconButton
          icon={<InputSearchIcon />}
          disabled
          variant="unstyled"
        ></SearchIconButton>
      </LeftSide>
      <RightSide>
        {isAuthenticatedFunc() ? (
          <p>
            {t(`auth.Logget inn som {{ personId }}`, {
              personId: tokenHolderFunc()?.personId,
            })}
          </p>
        ) : (
          <p>{t("auth.Ikke logget inn")}</p>
        )}
        <AuthenticationButton />
      </RightSide>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  grid-area: topbar;
  display: flex;
  padding: 0.5rem 1rem 0.5rem 0;
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
  gap: 1rem;
`;

const SearchInput = styled(Input)`
  width: 30%;
  min-width: 200px;
`;

const SearchIconButton = styled(Button)`
  margin-left: -48px;
  width: 24px;

  :disabled {
    outline-style: inherit;
  }
`;

const InputSearchIcon = styled(SearchIcon)`
  width: 24px;
`;

export default TopBar;
