import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import AuthenticationButton from "../Authentication/AuthenticationButton";
import Button from "components/form/Button";
import Input from "components/form/Input";
import { ReactComponent as SearchIcon } from "icons/search.svg";
import logo from "images/logo.png";

const TopBar = () => {
  const { isAuthenticatedFunc, tokenHolderFunc } = useAuthenticationFlow();

  const { t } = useTranslation();

  return (
    <Wrapper>
      <LeftSide>
        <img src={logo} />
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
  height: 70px;
  display: flex;
`;

const LeftSide = styled.div`
  display: flex;
  align-items: center;
  flex: 1;

  > * {
    margin-right: 16px;
    margin-top: 8px;
  }

  > img {
    margin-top: -8px;
  }
`;

const RightSide = styled.div`
  margin-right: 16px;

  p {
    margin: 8px 0;
  }
`;

const SearchInput = styled(Input)`
  width: 30%;
  min-width: 200px;
`;

const SearchIconButton = styled(Button)`
  margin-left: -48px;
  width: 24px;
`;

const InputSearchIcon = styled(SearchIcon)`
  width: 24px;
`;

export default TopBar;
