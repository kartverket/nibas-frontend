import styled from "styled-components";
import HeaderButton from "./HeaderButton";
import HeaderBreadcrumb from "./HeaderBreadcrumb";
import { Spacer } from "@kvib/react";

const Header = () => {
  return (
    <Container>
      <UtkastBar>
        <HeaderButton icon="home" label="Utkast" labelIsHidden />
        <HeaderBreadcrumb />
        <HeaderButton icon="edit_note" label="Rediger utkast" labelIsHidden />
        <HeaderButton icon="undo" label="Angre" />
        <HeaderButton icon="redo" label="Gjør om" />
        <HeaderButton icon="save" label="Lagre" />
        <HeaderButton icon="published_with_changes" label="Endringslogg" />
      </UtkastBar>
      <SubBar>
        <Spacer />
        <HeaderButton icon="upload" label="Publiser utkast" />
        <HeaderButton icon="delete" label="Slett utkast" />
      </SubBar>
    </Container>
  );
};

const Container = styled.header`
  grid-area: header;
  box-shadow: var(--kvib-shadows-base);
`;

const Bar = styled.section`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 18px;
`;

const UtkastBar = styled(Bar)`
  background: var(--kvib-colors-chakra-body-bg);
  border-bottom: 1px solid var(--kvib-colors-chakra-border-color);
`;

const SubBar = styled(Bar)`
  background: var(--kvib-colors-gray-50);
`;

export default Header;
