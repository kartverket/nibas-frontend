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

  const auth = useAuthRenewError();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).forceAutomatiskUtlogging = () => auth.setAuthRenewError(true);

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
    }
    clear();
    setAuthRenewError(false);
    signIn(utkast?.id != null && utkast?.id !== "" ? { state: { utkastId: utkast.id } } : undefined);
  };

  return (
    <>
      <Modal blockScrollOnMount={false} isOpen={authRenewError} onClose={() => setAuthRenewError(false)} size="2xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Du har blitt logget ut automatisk</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb="1rem">
              På grunn av en begrensning hos IDporten vil man måtte logge inn på nytt hver 2. time. Sørg derfor for at
              du lagrer utkastet ditt så ofte som mulig.
            </Text>
            <Text fontWeight="bold" mb="1rem">
              Dersom du hadde ulagrede endringer kan vi dem. Ønsker du å logge inn på nytt og gjenopprette endringene?
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              variant="secondary"
              mr={3}
              onClick={() => {
                setAuthRenewError(false);
              }}
            >
              Forbli logget ut
            </Button>
            <Button variant="primary" onClick={onRelog}>
              Logg inn og gjenopprett
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
