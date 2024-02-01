import { useState } from "react";

const useAlertModal = (title: string, body: string) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const openModal = () => setModalIsOpen(true);
  const closeModal = () => setModalIsOpen(false);
  return {
    modalIsOpen,
    openModal,
    closeModal,
    modalTitle: title,
    modalBody: body,
  };
};

export default useAlertModal;
