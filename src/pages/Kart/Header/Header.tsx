import styled from "styled-components";
import HeaderButton from "./HeaderButton";
import HeaderBreadcrumb from "./HeaderBreadcrumb";

const Header = () => {
  return (
    <Container>
      <UtkastBar>
        <Section>
          <HeaderButton icon="home" label="Utkast" labelIsHidden />
          <HeaderBreadcrumb />
          <HeaderButton icon="edit_note" label="Rediger utkast" labelIsHidden />
        </Section>
        <Section>
          <HeaderButton icon="undo" label="Angre" />
          <HeaderButton icon="redo" label="Gjør om" />
          <HeaderButton icon="save" label="Lagre" />
          <HeaderButton icon="published_with_changes" label="Endringslogg" />
        </Section>
      </UtkastBar>
      <SubBar>
        <Section>
          <HeaderButton icon="travel_explore" label="TODO: Åpne en inndeling" />
        </Section>
        <Section>
          <HeaderButton icon="upload" label="Publiser utkast" />
          <HeaderButton icon="delete" label="Slett utkast" />
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
