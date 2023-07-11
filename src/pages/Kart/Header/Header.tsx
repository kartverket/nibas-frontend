import styled from "styled-components";
import HeaderButton from "./HeaderButton";
import HeaderBreadcrumb from "./HeaderBreadcrumb";
import HeaderHistoryOperations from "./HeaderHistoryOperations";
import { Spacer } from "@kvib/react";
import HeaderUtkastOperations from "./HeaderUtkastOperations";

const Header = () => {
  return (
    <Container>
      <UtkastBar>
        <HeaderBreadcrumb />
        <HeaderHistoryOperations />
      </UtkastBar>
      <SubBar>
        <Spacer />
        <HeaderUtkastOperations />
      </SubBar>
    </Container>
  );
};

const Container = styled.header`
  grid-area: header;
  box-shadow: var(--kvib-shadows-base);
`;

const Bar = styled.article`
  display: flex;
  justify-content: space-between;
  padding: 12px 18px;
  gap: 64px;
`;

const UtkastBar = styled(Bar)`
  background: var(--kvib-colors-chakra-body-bg);
  border-bottom: 1px solid var(--kvib-colors-chakra-border-color);
`;

const SubBar = styled(Bar)`
  background: var(--kvib-colors-gray-50);
`;

export default Header;
