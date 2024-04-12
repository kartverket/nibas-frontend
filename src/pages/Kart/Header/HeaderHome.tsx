import { useHistory } from "contexts/HistoryContext/HistoryContext";
import useAlertModal from "hooks/useAlertModal";
import HeaderButton from "./HeaderButton";
import AlertModal from "components/Modals/AlertModal";
import { useNavigate } from "react-router-dom";
import { routes } from "utils/routes";

const HeaderHome = () => {
  const { canSave } = useHistory();
  const navigate = useNavigate();

  const { modalIsOpen, openModal, closeModal, modalTitle, modalBody } = useAlertModal(
    "Du har endringer i utkastet som ikke er lagret",
    "Er du sikker på at du vil gå ut av utkastet? Dersom du lukker utkastet nå mister du alle ulagrede endringer.",
  );

  const handleHome = () => {
    if (canSave) {
      openModal();
    } else {
      navigate(routes.index);
    }
  };

  return (
    <>
      <HeaderButton
        label="Startside"
        icon="home"
        onClick={handleHome}
        tooltip={{ text: "Gå tilbake til startsiden" }}
        isLabelHidden={true}
      />
      <AlertModal
        status="warning"
        title={modalTitle}
        description={modalBody}
        isOpen={modalIsOpen}
        onClose={closeModal}
        secondaryAction={{
          text: "Forkast endringer",
          onClick: () => navigate(routes.index),
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
