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

type ConfirmationModalOptions = {
  title: string;
  description: string;
  acceptText?: string;
  declineText?: string;
  onAccept?: () => void;
  onDecline?: () => void;
};

export type ConfirmationModalContextValue = {
  open: (options: ConfirmationModalOptions) => void;
  openAsync: (options: ConfirmationModalOptions) => Promise<boolean>;
};

export const ConfirmationModalContext = createContext<ConfirmationModalContextValue | undefined>(undefined);

export const ConfirmationModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [modal, setModal] = useState<ConfirmationModalProps | null>(null);

  const getModalPropsFromOptions = (modalOptions: ConfirmationModalOptions): ConfirmationModalProps => {
    return {
      ...modalOptions,
      onAccept: () => {
        if (modalOptions.onAccept) modalOptions.onAccept();

        setModal(null);
      },
      onDecline: () => {
        if (modalOptions.onDecline) modalOptions.onDecline();

        setModal(null);
      },
    };
  };

  const open = (modalOptions: ConfirmationModalOptions) => {
    setModal(getModalPropsFromOptions(modalOptions));
  };

  const openAsync = (modalOptions: ConfirmationModalOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      const props = getModalPropsFromOptions(modalOptions);

      props.onAccept = () => {
        if (modalOptions.onAccept) modalOptions.onAccept();

        setModal(null);

        resolve(true);
      };

      props.onDecline = () => {
        if (modalOptions.onDecline) modalOptions.onDecline();

        setModal(null);

        resolve(false);
      };

      setModal(props);
    });
  };

  const value = {
    open,
    openAsync,
  };

  return (
    <ConfirmationModalContext.Provider value={value}>
      {children}
      {modal && <ConfirmationModal {...modal}></ConfirmationModal>}
    </ConfirmationModalContext.Provider>
  );
};

export const useConfirmationModal = () => {
  const context = useContext(ConfirmationModalContext);
  if (!context) {
    throw new Error("useConfirmationModal must be used within a ConfirmationModalContext");
  }

  return context;
};
