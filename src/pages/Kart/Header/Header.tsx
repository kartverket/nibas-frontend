import { styled } from "styled-components";
import HeaderBreadcrumb from "./HeaderBreadcrumb";
import HeaderHistoryOperations from "./HeaderHistoryOperations";
import HeaderUtkastOperations from "./HeaderUtkastOperations";
import HeaderButton from "./HeaderButton";
import { useSidebarPanel } from "contexts/SidebarPanelContext";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { useUtkast } from "contexts/UtkastContext";
import HeaderHome from "./HeaderHome";

const Header = () => {
  const { utkast } = useUtkast();
  const { activeSidebarPanel, openSidebarPanel, closeSidebarPanel } =
    useSidebarPanel();
  const { closeOverlayPanel } = useOverlayPanel();

  const toggleSidebar = () => {
    if (activeSidebarPanel === "inndelinger") {
      closeSidebarPanel();
    } else {
      openSidebarPanel("inndelinger");
      closeOverlayPanel();
    }
  };

  return (
    <Container>
      <UtkastBar>
        <HeaderBreadcrumb />
        <HeaderHistoryOperations />
      </UtkastBar>
      <SubBar>
        <Section>
          {!utkast && <HeaderHome />}
          <HeaderButton
            label="Åpne en inndeling"
            icon="travel_explore"
            onClick={toggleSidebar}
          />
        </Section>
        <HeaderUtkastOperations />
      </SubBar>
    </Container>
  );
};

const Container = styled.header`
  grid-area: header;
  box-shadow: var(--kvib-shadows-base);
  z-index: 10;
`;

const Bar = styled.article`
  display: flex;
  justify-content: space-between;
  padding: 12px 18px;
  gap: 64px;

  &:empty {
    display: none;
  }
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
