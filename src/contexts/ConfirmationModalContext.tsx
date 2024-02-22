import ConfirmationModal from "components/Modals/ConfirmationModal";
import React, { createContext, useContext, useState } from "react";

export type ConfirmationModalProps = {
  title: string;
  description: string;
  acceptText?: string;
  declineText?: string;
  onAccept: () => void;
  onDecline: () => void;
};

export type ConfirmationModalInstance = {
  title: string;
  description: string;
  acceptText?: string;
  declineText?: string;
  onAccept?: () => void;
  onDecline?: () => void;
};

export type ConfirmationModalContextValue = {
  modals: ConfirmationModalProps[];
  setModals: (modals: ConfirmationModalProps[]) => void;
  addModal: (modal: ConfirmationModalProps) => void;
  removeModal: (modalKey: string) => void;
};

export const ConfirmationModalContext = createContext<ConfirmationModalContextValue | undefined>(undefined);

export const ConfirmationModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [modals, setModals] = useState<ConfirmationModalProps[]>([]);

  const addModal = (props: ConfirmationModalProps) => {
    const modalWithSameKeyExists = modals.findIndex((modal) => modal.title === props.title) >= 0;

    if (!modalWithSameKeyExists) {
      setModals(modals.concat(props));
    }
  };

  const removeModal = (modalKey: string) => {
    const filteredModals = modals.filter((modal) => modal.title !== modalKey);

    setModals(filteredModals);
  };

  const value = {
    modals,
    setModals,
    addModal,
    removeModal,
  };

  return (
    <ConfirmationModalContext.Provider value={value}>
      {children}
      {modals.map((modal: ConfirmationModalProps) => {
        return <ConfirmationModal key={modal.title} {...modal}></ConfirmationModal>;
      })}
    </ConfirmationModalContext.Provider>
  );
};

export const useConfirmationModal = (modal: ConfirmationModalInstance) => {
  const context = useContext(ConfirmationModalContext);
  if (!context) {
    throw new Error("useConfirmationModal must be used within a ConfirmationModalContext");
  }

  const getDefaultModalPropsFromOptions = (): ConfirmationModalProps => {
    return {
      ...modal,
      onAccept: () => {
        if (modal.onAccept) modal.onAccept();

        context.removeModal(modal.title);
      },
      onDecline: () => {
        if (modal.onDecline) modal.onDecline();

        context.removeModal(modal.title);
      },
    };
  };

  const open = () => {
    context.addModal(getDefaultModalPropsFromOptions());
  };

  const openAsync = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const props = getDefaultModalPropsFromOptions();

      props.onAccept = () => {
        if (modal.onAccept) modal.onAccept();

        context.removeModal(modal.title);

        resolve(true);
      };

      props.onDecline = () => {
        if (modal.onDecline) modal.onDecline();

        context.removeModal(modal.title);

        resolve(false);
      };

      context.addModal(props);
    });
  };

  return {
    open,
    openAsync,
  };
};
