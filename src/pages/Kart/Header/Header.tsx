import { styled } from "styled-components";
import HeaderBreadcrumb, { Separator } from "./HeaderBreadcrumb";
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
import { useInndelinger } from "contexts/InndelingerContext/InndelingerContext";
import useFylker from "hooks/inndelinger/useFylker";
import useKommuner from "hooks/inndelinger/useKommuner";
import { inndelingResponseNavnToString } from "contexts/InndelingerContext/useInndelingFeatures";
import { Breadcrumb, BreadcrumbItem, Hide, Text } from "@kvib/react";
import { capitalize } from "utils/string-utils";
import { KommuneResponse } from "types/api";

const Header = () => {
  const { utkast } = useUtkast();
  const { history } = useHistory();
  const { activeOverlayModal, closeOverlayModal, openOverlayModal } = useOverlayPanel();
  const { openAsync } = useConfirmationModal();

  const { currentlyEditingInndelinger, selectedFylkeId } = useInndelinger();

  const { fylker } = useFylker(selectedFylkeId !== "");
  const { kommuner } = useKommuner(selectedFylkeId, selectedFylkeId !== "");

  const activeFylke = fylker?.find((fylke) => fylke.id.lokalid.value === selectedFylkeId);
  const activeKommuner = kommuner?.filter((kommune) =>
    currentlyEditingInndelinger.map((inndeling) => inndeling.id).includes(kommune.id.lokalid.value),
  );

  const getReadableStringFromKommuner = (responses: KommuneResponse[]) => {
    const responsesToString = responses.map(
      (response) => `${response.nummer} ${inndelingResponseNavnToString(response.navn)}`,
    );

    if (responsesToString.length === 1) return responsesToString[0];

    const responsesExceptLast = responsesToString.slice(0, -1);
    const responseLast = responsesToString.slice(-1);

    return `${responsesExceptLast.join(", ")} og ${responseLast}`;
  };

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
          {utkast && (
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
              variant="primary"
            />
          )}
          <HeaderButton
            label="Forhåndsvis en inndeling"
            icon="preview"
            onClick={() => toggleModal("inndelinger-view")}
            tooltip={{
              text: "Åpne og se en inndeling i kartet",
            }}
            variant={utkast == null ? "primary" : "ghost"}
          />
          {activeFylke && currentlyEditingInndelinger.length > 0 && (
            <Hide below="xl">
              <Breadcrumb separator={<Separator icon="chevron_right" />} spacing={0}>
                <BreadcrumbItem>
                  <InndelingText>{capitalize(currentlyEditingInndelinger[0].inndelingtype)}</InndelingText>
                </BreadcrumbItem>
                <BreadcrumbItem>
                  <InndelingText $isBold={activeKommuner == null}>
                    {activeFylke.nummer} {inndelingResponseNavnToString(activeFylke.navn)}
                  </InndelingText>
                </BreadcrumbItem>
                {activeKommuner && activeKommuner.length > 0 && (
                  <BreadcrumbItem>
                    <InndelingText $isBold>{getReadableStringFromKommuner(activeKommuner)}</InndelingText>
                  </BreadcrumbItem>
                )}
              </Breadcrumb>
            </Hide>
          )}
        </HeaderSection>
        {utkast && <HeaderUtkastOperations utkast={utkast} />}
      </Bar>
    </Container>
  );
};

const InndelingText = styled(Text)<{ $isBold?: boolean }>`
  ${(props) => props.$isBold === true && "font-weight: var(--kvib-fontWeights-bold)"};
`;

const Container = styled.header`
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
