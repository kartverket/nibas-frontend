import { styled } from "styled-components";
import HeaderBreadcrumb from "./HeaderBreadcrumb";
import HeaderHistoryOperations from "./HeaderHistoryOperations";
import HeaderUtkastOperations from "./HeaderUtkastOperations";
import HeaderButton, { HeaderSection } from "./HeaderButton";
import { useSidebarPanel } from "contexts/SidebarPanelContext";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { useUtkast } from "contexts/UtkastContext/UtkastContext";
import HeaderHome from "./HeaderHome";
import { useKeyboardShortcut } from "hooks/keyboard-shortcuts/keyboard-shortcuts-hook";
import { zindex } from "utils/constants";

const Header = () => {
  const { utkast } = useUtkast();
  const { activeSidebarPanel, openSidebarPanel, closeSidebarPanel } = useSidebarPanel();
  const { closeOverlayPanel, activeOverlayModal, closeOverlayModal, openOverlayModal } = useOverlayPanel();

  const toggleSidebar = () => {
    if (activeSidebarPanel === "inndelinger") {
      closeSidebarPanel();
    } else {
      openSidebarPanel("inndelinger");
      closeOverlayPanel();
    }
  };

  const toggleModal = (modalName: "inndelinger-redigering" | "inndelinger-visning") => {
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
      <Bar>
        <HeaderSection>
          {!utkast && <HeaderHome />}
          <HeaderButton
            variant="primary"
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
        </HeaderSection>
        {utkast && <HeaderUtkastOperations utkast={utkast} />}
      </Bar>
    </Container>
  );
};

const Container = styled.header`
  grid-area: header;
  box-shadow: var(--kvib-shadows-base);
  z-index: ${zindex.mapHeader};
  font-size: var(--kvib-fontSizes-sm);
`;

const Bar = styled.article`
  display: flex;
  justify-content: space-between;
  padding: 10px 18px;
  gap: 64px;

  &:empty {
    display: none;
  }
`;

const UtkastBar = styled(Bar)`
  background: var(--kvib-colors-chakra-body-bg);
  border-bottom: 1px solid var(--kvib-colors-chakra-border-color);
`;

export default Header;
