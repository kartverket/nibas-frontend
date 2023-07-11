import styled from "styled-components";
import HeaderButton from "./HeaderButton";
import HeaderBreadcrumb from "./HeaderBreadcrumb";
import { routes } from "utils/routes";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <UtkastBar>
        <Section>
          <HeaderButton
            label="Utkast"
            icon="home"
            onClick={() => navigate(routes.utkast)}
            labelIsHidden
          />
          <HeaderBreadcrumb />
          <HeaderButton
            label="Rediger utkast"
            icon="edit_note"
            onClick={() => console.log("TODO")}
            labelIsHidden
          />
        </Section>
        <Section>
          <HeaderButton
            label="Angre"
            icon="undo"
            onClick={() => console.log("TODO")}
          />
          <HeaderButton
            label="Gjør om"
            icon="redo"
            onClick={() => console.log("TODO")}
          />
          <HeaderButton
            label="Lagre"
            icon="save"
            onClick={() => console.log("TODO")}
          />
          <HeaderButton
            label="Endringslogg"
            icon="published_with_changes"
            onClick={() => console.log("TODO")}
          />
        </Section>
      </UtkastBar>
      <SubBar>
        <Section></Section>
        <Section>
          <HeaderButton
            label="Publiser utkast"
            icon="upload"
            onClick={() => console.log("TODO")}
          />
          <HeaderButton
            label="Slett utkast"
            icon="delete"
            onClick={() => console.log("TODO")}
          />
        </Section>
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

const Section = styled.section`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export default Header;
