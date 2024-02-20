import ConfirmationModal from "components/Modals/ConfirmationModal";
import React, { createContext, useContext, useState } from "react";

// TODO Rename
export type ConfirmationModalProps = {
  title: string;
  description: string;
  isOpen: boolean;
  onAccept: () => void;
  onDeny?: () => void;
};

export type ConfirmationModalContextValue = {
  modals: ConfirmationModalProps[];
  setModals: (modals: ConfirmationModalProps[]) => void;
};

export const ConfirmationModalContext = createContext<ConfirmationModalContextValue | undefined>(undefined);

export const ConfirmationModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [modals, setModals] = useState<ConfirmationModalProps[]>([]);

  const value = {
    modals,
    setModals,
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

export const useConfirmationModal = (props: ConfirmationModalProps) => {
  const context = useContext(ConfirmationModalContext);
  if (!context) {
    throw new Error("useConfirmationModal must be used within a ConfirmationModalContext");
  }

  const open = () => {
    context.setModals(context.modals.concat[props]);
  };

  const close = () => {};

  const openAsync = () => {};

  return {};
};
