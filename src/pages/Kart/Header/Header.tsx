import { styled } from "styled-components";
import HeaderBreadcrumb from "./HeaderBreadcrumb";
import HeaderHistoryOperations from "./HeaderHistoryOperations";
import HeaderUtkastOperations from "./HeaderUtkastOperations";
import HeaderButton from "./HeaderButton";
import { useSidebarPanel } from "contexts/SidebarPanelContext";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { useUtkast } from "contexts/UtkastContext";
import HeaderHome from "./HeaderHome";
import { useKeyboardShortcut } from "hooks/keyboard-shortcuts/keyboard-shortcuts-hook";
import { zindex } from "utils/constants";

const Header = () => {
  const { utkast } = useUtkast();
  const { activeSidebarPanel, openSidebarPanel, closeSidebarPanel } =
    useSidebarPanel();
  const {
    closeOverlayPanel,
    openOverlayModal,
    closeOverlayModal,
    activeOverlayModal,
  } = useOverlayPanel();

  const toggleSidebar = () => {
    if (activeSidebarPanel === "inndelinger") {
      closeSidebarPanel();
    } else {
      openSidebarPanel("inndelinger");
      closeOverlayPanel();
    }
  };

  const toggleModal = (
    modalName: "inndelinger-redigering" | "inndelinger-visning",
  ) => {
    if (activeOverlayModal === modalName) {
      closeOverlayModal();
    } else {
      openOverlayModal(modalName);
    }
  };

  useKeyboardShortcut("open", toggleSidebar);

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
            tooltip={{
              text: "Åpne og rediger en inndeling i kartet",
              shortcut: "open",
            }}
          />
          <HeaderButton
            label="Temp: Rediger en inndeling"
            icon="travel_explore"
            onClick={() => toggleModal("inndelinger-redigering")}
            tooltip={{
              text: "Åpne og rediger en inndeling i kartet",
              shortcut: "open",
            }}
          />
          <HeaderButton
            label="Temp: Vis en inndeling"
            icon="travel_explore"
            onClick={() => toggleModal("inndelinger-visning")}
            tooltip={{
              text: "Åpne og rediger en inndeling i kartet",
              shortcut: "open",
            }}
          />
        </Section>
        {utkast && <HeaderUtkastOperations utkast={utkast} />}
      </SubBar>
    </Container>
  );
};

const Container = styled.header`
  grid-area: header;
  box-shadow: var(--kvib-shadows-base);
  z-index: ${zindex.mapHeader};
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
