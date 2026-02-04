import { Button, Divider, Flex, Text, Tooltip } from "@kvib/react";
import { useConfirmationModal } from "contexts/ConfirmationModalContext";
import { useValgtGyldighetsdato } from "contexts/GyldighetsdatoContext";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { useInndelinger } from "contexts/InndelingerContext/InndelingerContext";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { useUtkast } from "contexts/UtkastContext/UtkastContext";
import useFylker from "hooks/inndelinger/useFylker";
import useKommuner from "hooks/inndelinger/useKommuner";
import { KeyboardShortcuts } from "hooks/keyboard-shortcuts/keyboard-shortcuts";
import { useKeyboardShortcut } from "hooks/keyboard-shortcuts/keyboard-shortcuts-hook";
import HeaderVelgGyldighetsdato from "pages/Kart/Header/HeaderVelgGyldighetsdato";
import { useNavigate } from "react-router-dom";
import { styled } from "styled-components";
import { Inndelingtype, KommuneResponse } from "types/api";
import { zindex } from "utils/constants";
import { inndelingResponseNavnToString } from "utils/language/language";
import { routes } from "utils/routes";
import CustomTooltip from "../Toolbar/CustomTooltip";
import HeaderBreadcrumb from "./HeaderBreadcrumb";
import HeaderButton, { HeaderSection } from "./HeaderButton";
import HeaderHistoryOperations from "./HeaderHistoryOperations";
import HeaderUtkastOperations from "./HeaderUtkastOperations";
import { getInndelingtypeLabel } from "utils/inndelinger-utils";

const Header = () => {
  const { utkast } = useUtkast();
  const { gyldighetsdato } = useValgtGyldighetsdato();
  const { history } = useHistory();
  const { toggleOverlayModal } = useOverlayPanel();
  const { openAsync } = useConfirmationModal();
  const navigate = useNavigate();

  const { currentlyEditingInndelinger, selectedFylkeIds } = useInndelinger();

  const { fylker } = useFylker(gyldighetsdato, selectedFylkeIds.length > 0);
  const { kommuner } = useKommuner(selectedFylkeIds, gyldighetsdato, selectedFylkeIds.length > 0);

  const activeFylker = fylker?.filter((fylke) => selectedFylkeIds.includes(fylke.id.lokalid.value) === true);
  const activeKommuner = kommuner?.filter((kommune) =>
    currentlyEditingInndelinger.map((inndeling) => inndeling.id).includes(kommune.id.lokalid.value),
  );

  const getReadableStringFromKommuner = (responses: KommuneResponse[]) => {
    const responsesToString = responses.map(
      (response) => `${response.nummer} ${inndelingResponseNavnToString(response.navn)}`,
    );

    if (responsesToString.length === 1) {
      return responsesToString[0];
    }

    const responsesExceptLast = responsesToString.slice(0, -1);
    const responseLast = responsesToString.slice(-1);

    return `${responsesExceptLast.join(", ")} og ${responseLast}`;
  };

  const hasUnsavedChangesInHistory = history.index > 0;

  const confirmSelectIfDirtyModal = () =>
    openAsync({
      title: "Ulagrede endringer i utkast",
      description:
        "Du har ulagrede endringer i utkastet ditt. Å redigere en ny inndeling vil forkaste endringene i utkastet. Ønsker du å fortsette?",
      acceptText: "Forkast endringene",
      declineText: "Gå tilbake til redigering",
    });

  useKeyboardShortcut("open", () => toggleOverlayModal(utkast ? "inndelinger" : "inndelinger-view"));

  const getInndelingTypeHeaderLabel = (inndelingtype: Inndelingtype, antall: number) => {
    switch (inndelingtype) {
      case "FYLKE":
        return antall > 1 ? "fylkene" : "fylket";
      case "KOMMUNE":
        return antall > 1 ? "kommunene" : "kommunen";
      case "STEMMEKRETS":
        return getInndelingtypeLabel(inndelingtype) + "er";
      case "GRUNNKRETS":
        return getInndelingtypeLabel(inndelingtype) + "er";
      case "BOPLIKTOMRAADE":
        return getInndelingtypeLabel(inndelingtype) + "r";
    }
  };

  return (
    <Container>
      <UtkastBar>
        {!utkast && (
          <Flex alignItems="center">
            <CustomTooltip text="Tilbake til forsiden">
              <Button leftIcon="arrow_back" variant="tertiary" size="sm" onClick={() => navigate(routes.index)}>
                Tilbake til forsiden
              </Button>
            </CustomTooltip>
            <Divider marginLeft="8px" orientation="vertical" />
            <Flex paddingLeft="14px" gap={1} alignItems="center">
              <Text sx={{ color: "gray.700" }}>
                Forhåndsvis en inndeling ved å bruke {KeyboardShortcuts["preview"].displayString} eller ved å benytte
                kartlagsmenyen
              </Text>
            </Flex>
          </Flex>
        )}
        <HeaderBreadcrumb />
        <Flex gap={1}>
          <HeaderHistoryOperations />
          <Divider marginRight="8px" marginLeft="8px" orientation="vertical" />
          {utkast && <HeaderUtkastOperations utkast={utkast} />}
          {!utkast && <HeaderVelgGyldighetsdato />}
        </Flex>
      </UtkastBar>
      <OpenInndelingerBar>
        <HeaderSection>
          {utkast && (
            <HeaderButton
              label="Rediger inndeling"
              onClick={async () => {
                if (hasUnsavedChangesInHistory) {
                  const shouldToggle = await confirmSelectIfDirtyModal();
                  if (!shouldToggle) {
                    return;
                  }
                }
                toggleOverlayModal("inndelinger");
              }}
              tooltip={{
                text: "Åpne og rediger en inndeling i kartet",
                shortcut: "open",
              }}
              variant="primary"
            />
          )}
          {utkast &&
            (activeFylker && activeFylker.length > 0 && currentlyEditingInndelinger.length > 0 ? (
              <Flex alignItems="center" gap={1} padding="0 12px">
                {/* Kommuner */}
                {activeKommuner && activeKommuner.length > 0 && (
                  <TextWrapper>
                    {activeKommuner.length > 4 ? (
                      <Tooltip
                        label={activeKommuner.map((kommune) => (
                          <p key={kommune.nummer}>
                            {kommune.nummer} {inndelingResponseNavnToString(kommune.navn)}
                          </p>
                        ))}
                      >
                        <InndelingText>{activeKommuner.length} kommuner redigeres</InndelingText>
                      </Tooltip>
                    ) : (
                      <InndelingText>
                        {`Redigerer 
                          ${getInndelingTypeHeaderLabel(currentlyEditingInndelinger[0].inndelingtype, currentlyEditingInndelinger.length)} 
                          ${currentlyEditingInndelinger[0].inndelingtype === "KOMMUNE" || currentlyEditingInndelinger[0].inndelingtype === "FYLKE" ? "" : "i"} 
                          ${getReadableStringFromKommuner(activeKommuner)}
                        `}
                      </InndelingText>
                    )}
                  </TextWrapper>
                )}

                {/* Fylker */}
                {activeFylker.length > 0 && (!activeKommuner || activeKommuner.length === 0) && (
                  <TextWrapper>
                    {activeFylker.length > 4 ? (
                      <Tooltip
                        label={activeFylker.map((fylke) => (
                          <p key={fylke.nummer}>
                            {fylke.nummer} {inndelingResponseNavnToString(fylke.navn)}
                          </p>
                        ))}
                      >
                        <InndelingText>{activeFylker.length} fylker redigeres</InndelingText>
                      </Tooltip>
                    ) : (
                      <InndelingText>
                        {`Redigerer 
                          ${getInndelingTypeHeaderLabel(currentlyEditingInndelinger[0].inndelingtype, currentlyEditingInndelinger.length)} 
                          ${currentlyEditingInndelinger[0].inndelingtype === "KOMMUNE" || currentlyEditingInndelinger[0].inndelingtype === "FYLKE" ? "" : "i"} 
                          ${activeFylker.map((f) => inndelingResponseNavnToString(f.navn)).join(", ")}
                        `}
                      </InndelingText>
                    )}
                  </TextWrapper>
                )}
              </Flex>
            ) : (
              <Text sx={{ color: "gray.700", padding: "0 12px" }}>Ingen inndelinger redigeres for øyeblikket</Text>
            ))}
        </HeaderSection>
      </OpenInndelingerBar>
    </Container>
  );
};

const InndelingText = styled(Text)<{ $isBold?: boolean }>`
  ${(props) => props.$isBold === true && "font-weight: var(--kvib-fontWeights-bold)"};
  display: flex;
`;

const TextWrapper = styled.div`
  font-weight: 600;
`;

const Container = styled.div`
  z-index: ${zindex.mapHeader};
  font-size: var(--kvib-fontSizes-sm);
`;

const OpenInndelingerBar = styled(Flex)`
  justify-content: space-between;
  position: absolute;
  background: var(--kvib-colors-chakra-body-bg);
  border-radius: var(--kvib-radii-md);
  margin-top: 18px;
  margin-left: 18px;
  box-shadow: var(--kvib-shadows-sm);

  &:empty {
    display: none;
  }
`;

const UtkastBar = styled(Flex)`
  justify-content: space-between;
  padding: 10px 18px;
  background: var(--kvib-colors-chakra-body-bg);
  border-bottom: 1px solid var(--kvib-colors-chakra-border-color);
`;

export default Header;
