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
import { useConfirmationModal } from "contexts/ConfirmationModalContext";
import { useHistory } from "contexts/HistoryContext/HistoryContext";

const Header = () => {
  const { utkast } = useUtkast();
  const { history } = useHistory();
  const { activeOverlayModal, closeOverlayModal, openOverlayModal } = useOverlayPanel();
  const { openAsync } = useConfirmationModal();

  const toggleModal = (modalName: "inndelinger" | "inndelinger-view") => {
    if (activeOverlayModal === modalName) {
      closeOverlayModal();
    } else {
      openOverlayModal(modalName);
    }
  };

  const hasUnsavedChangesInHistory = history.entries.length > 0;

  const confirmSelectIfDirtyModal = () =>
    openAsync({
      title: "Ulagrede endringer i utkast",
      description:
        "Du har ulagrede endringer i utkastet ditt. Å redigere en ny inndeling vil forkaste endringene i utkastet. Ønsker du å fortsette?",
      acceptText: "Ja",
      declineText: "Gå tilbake",
    });

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
            label="Rediger en inndeling"
            icon="travel_explore"
            onClick={async () => {
              if (hasUnsavedChangesInHistory) {
                const shouldToggle = await confirmSelectIfDirtyModal();
                if (!shouldToggle) return;
              }
              toggleModal("inndelinger");
            }}
            tooltip={{
              text: "Åpne og rediger en inndeling i kartet",
              shortcut: "open",
            }}
            isPrimary={true}
          />
          <HeaderButton
            label="Forhåndsvis en inndeling"
            icon="preview"
            onClick={() => toggleModal("inndelinger-view")}
            tooltip={{
              text: "Åpne og se en inndeling i kartet",
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
