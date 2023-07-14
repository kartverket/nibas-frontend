import { useToolbar } from "contexts/ToolbarContext";
import { useKeyboardShortcut } from "hooks/keyboard-shortcuts/keyboard-shortcuts-hook";
import useAlertModal from "hooks/useAlertModal";
import HeaderButton from "./HeaderButton";
import { useUtkast } from "contexts/UtkastContext";
import AlertModal from "components/Modals/AlertModal";

const HeaderHome = () => {
  const { closeUtkast } = useUtkast();
  const { canSave } = useToolbar();

  const { modalIsOpen, openModal, closeModal, modalTitle, modalBody } =
    useAlertModal(
      "Du har endringer i utkastet som ikke er lagret",
      "Er du sikker på at du vil gå ut av utkastet? Dersom du lukker utkastet nå mister du alle ulagrede endringer."
    );

  const handleHome = () => {
    if (canSave) {
      openModal();
    } else {
      closeUtkast();
    }
  };

  useKeyboardShortcut("close", handleHome);

  return (
    <>
      <HeaderButton
        label="Utkast"
        icon="home"
        onClick={handleHome}
        labelIsHidden
      />
      <AlertModal
        status="warning"
        title={modalTitle}
        description={modalBody}
        isOpen={modalIsOpen}
        onClose={closeModal}
        secondaryAction={{
          text: "Forkast endringer",
          onClick: closeUtkast,
        }}
        primaryAction={{
          text: "Fortsett redigering",
          onClick: closeModal,
        }}
      />
    </>
  );
};
export default HeaderHome;
