import { styled } from "styled-components";
import HeaderBreadcrumb from "./HeaderBreadcrumb";
import HeaderHistoryOperations from "./HeaderHistoryOperations";
import HeaderUtkastOperations from "./HeaderUtkastOperations";
import HeaderButton, { HeaderSection } from "./HeaderButton";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { useUtkast } from "contexts/UtkastContext/UtkastContext";
import HeaderHome from "./HeaderHome";
import { useKeyboardShortcut } from "hooks/keyboard-shortcuts/keyboard-shortcuts-hook";
import { zindex } from "utils/constants";

const Header = () => {
  const { utkast } = useUtkast();
  const { activeOverlayModal, closeOverlayModal, openOverlayModal } = useOverlayPanel();

  const toggleModal = (modalName: "inndelinger") => {
    if (activeOverlayModal === modalName) {
      closeOverlayModal();
    } else {
      openOverlayModal(modalName);
    }
  };

  useKeyboardShortcut("open", () => toggleModal("inndelinger"));

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
            label="Temp: Rediger en inndeling"
            icon="travel_explore"
            onClick={() => toggleModal("inndelinger")}
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
