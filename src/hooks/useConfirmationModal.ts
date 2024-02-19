import ConfirmationModal from "components/Modals/ConfirmationModal";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createRoot, hydrateRoot } from "react-dom/client";

const useConfirmationModal = (title: string, description: string) => {
  const [isVisible, setIsVisible] = useState(false);

  const promiseRef = useRef({
    resolve: (_value: boolean) => {
      setIsVisible(false);
    },
    reject: (_value: boolean) => {
      setIsVisible(false);
    },
  });

  const openModal = async (): Promise<boolean> => {
    ConfirmationModal({
      title: title,
      description: description,
      isOpen: isVisible,
      onAccept: promiseRef.current.resolve,
      onDeny: promiseRef.current.reject,
    });

    return new Promise((resolve, reject) => {
      promiseRef.current = {
        resolve,
        reject,
      };
      setIsVisible(true);
    });
  };

  return {
    openModal,
  };
};

export default useConfirmationModal;
