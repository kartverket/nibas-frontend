import {
  Button,
  Modal,
  ModalBody,
  Text,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Accordion,
  AccordionButton,
  AccordionPanel,
  AccordionItem,
} from "@kvib/react";
import { useAuthentication } from "./AuthenticationHook";
import { createContext, useContext, useEffect, useState } from "react";
import { useUtkast } from "contexts/UtkastContext/UtkastContext";
import { useInndelinger } from "contexts/InndelingerContext/InndelingerContext";
import { ApplicationState, saveApplicationStateToSessionStorage } from "contexts/application-state-utils";
import { useFeatureStyle } from "contexts/FeatureStyleContext/FeatureStyleContext";
import { useToolbar } from "contexts/ToolbarContext";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { map } from "pages/Kart/constants";

export const AuthRenewError = ({ children }: { children: React.ReactNode }) => {
  const { signIn, clear, events } = useAuthentication();
  const { utkast } = useUtkast();
  const { history } = useHistory();
  const { authRenewError, setAuthRenewError } = useAuthRenewError();
  const { currentlyEditingInndelinger, selectedFylkeId } = useInndelinger();
  const { selectedPoint, selectedFeatures } = useFeatureStyle();
  const { activeTool, activeModeTools } = useToolbar();
  const { activeOverlayModal, activeOverlayPanel } = useOverlayPanel();

  useEffect(() => {
    const silentRenewCleanupFn = events.addSilentRenewError(() => {
      setAuthRenewError(true);
    });
    const expiredTokenCleanupFn = events.addAccessTokenExpired(() => {
      setAuthRenewError(true);
    });
    return () => {
      silentRenewCleanupFn();
      expiredTokenCleanupFn();
    };
  }, [events, setAuthRenewError]);

  const onRelog = () => {
    if (utkast?.id != null) {
      const appState: ApplicationState = {
        historyState: history,
        utkast: utkast,
        selectedInndelinger: {
          inndelinger: currentlyEditingInndelinger,
          selectedFylkeId,
        },
        selectedPoint,
        selectedFeatures,
        activeTool,
        activeModeTools,
        activeOverlayPanel,
        activeOverlayModal,
        mapPosition: {
          center: map.getView().getCenter(),
          zoom: map.getView().getZoom(),
        },
      };

      saveApplicationStateToSessionStorage(appState);
      clear();
      setAuthRenewError(false);
      signIn({ state: { utkastId: utkast.id } });
    }
  };

  return (
    <>
      <Modal blockScrollOnMount={false} isOpen={authRenewError} onClose={() => setAuthRenewError(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Du har automatisk blitt logget ut</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontWeight="bold" mb="1rem">
              Du har automatisk blitt logget ut, og må logge inn på nytt hos IDPorten for å fortsette endringene Dersom
              du bytter nettleser i mellomtiden risikerer du å miste eventuelle ulagrede endringer
            </Text>

            <Accordion>
              <AccordionItem>
                <AccordionButton>Hvorfor ble jeg logget ut?</AccordionButton>
                <AccordionPanel>
                  På grunn av en begrensning hos IDporten vil man kun være logget inn i to timer om gangen. Om du ikke
                  hadde lagret de siste endringene dine idet du ble logget ut kan vi gjenopprette det etter du har
                  logget inn på nytt, så fremt du ikke bytter nettleser i mellomtiden.
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={() => {
                setAuthRenewError(false);
              }}
            >
              Lukk
            </Button>
            <Button variant="ghost" onClick={onRelog}>
              Logg inn på nytt
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {children}
    </>
  );
};

export type AuthRenewContextValue = {
  authRenewError: boolean;
  setAuthRenewError: (arg: boolean) => void;
};

export const AuthRenewContext = createContext<AuthRenewContextValue | undefined>(undefined);

export const AuthRenewProvider = ({ children }: { children: React.ReactNode }) => {
  const [authRenewError, setAuthRenewError] = useState(false);

  const value = {
    authRenewError,
    setAuthRenewError,
  };

  return <AuthRenewContext.Provider value={value}>{children}</AuthRenewContext.Provider>;
};

export const useAuthRenewError = () => {
  const context = useContext(AuthRenewContext);

  if (!context) {
    throw new Error("useAuthRenewError must be used within a AuthRenewContext");
  }

  return context;
};
