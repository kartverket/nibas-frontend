import styled from "styled-components";
import Button from "components/Button";
import Input from "components/Input";
import { ReactComponent as Search } from "icons/search.svg";
import logo from "images/logo.png";

const TopBar = () => {
  return (
    <Wrapper>
      <LeftSide>
        <img src={logo} />
        <span>Nasjonal inndelingsbase</span>
        <SearchInput type="text" placeholder="Koordinater" disabled />
        <SearchIconButton variant="icon" disabled>
          <InputSearchIcon />
        </SearchIconButton>
      </LeftSide>
      <RightSide>
        <p>Logget inn som ...</p>
        <p>Logg ut</p>
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

const InputSearchIcon = styled(Search)`  
  width: 24px;
}
`;

export default TopBar;
