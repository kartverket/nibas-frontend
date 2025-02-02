import { Button, Divider, Hide, Icon, Link, Text, useDisclosure } from "@kvib/react";
import { useUtkast } from "contexts/UtkastContext/UtkastContext";
import { styled } from "styled-components";
import HeaderButton, { HeaderSection } from "./HeaderButton";
import UtkastEndreModal from "components/Modals/UtkastEndreModal";
import { useNavigate } from "react-router-dom";
import { routes } from "utils/routes";
import useAlertModal from "hooks/useAlertModal";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import AlertModal from "components/Modals/AlertModal";
import CustomTooltip from "../Toolbar/CustomTooltip";

const HeaderBreadcrumb = () => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { utkast } = useUtkast();
  const { canSave } = useHistory();
  const navigate = useNavigate();

  const { modalIsOpen, openModal, closeModal, modalTitle, modalBody } = useAlertModal(
    "Du har ulagrede endringer",
    "Dersom du går ut av utkastet uten å lagre først vil du miste alle de ulagrede endringene dine. Er du sikker på at du vil gå ut av utkastet?",
  );

  const handleHome = () => {
    if (canSave) {
      openModal();
    } else {
      navigate(routes.utkast);
    }
  };

  if (!utkast) {
    return null;
  }

  return (
    <HeaderSection>
      <CustomTooltip text="Gå tilbake til utkastoversikten">
        <Button leftIcon="arrow_back" variant="tertiary" size="sm" onClick={handleHome}>
          Alle utkast
        </Button>
      </CustomTooltip>
      <Divider orientation="vertical" />
      <Hide below="lg">{utkast.endringstype}</Hide>
      <Text noOfLines={1}>{utkast.navn}</Text>
      <HeaderButton
        label="Rediger utkast"
        icon="edit_note"
        onClick={onOpen}
        isLabelHidden={true}
        tooltip={{ text: "Rediger detaljene til dette utkastet" }}
      />
      <UtkastEndreModal isOpen={isOpen} onClose={onClose} utkast={utkast} />
      <AlertModal
        status="warning"
        title={modalTitle}
        description={modalBody}
        isOpen={modalIsOpen}
        onClose={closeModal}
        secondaryAction={{
          text: "Forkast endringer",
          onClick: () => navigate(routes.utkast),
        }}
        primaryAction={{
          text: "Fortsett redigering",
          onClick: closeModal,
        }}
      />
    </HeaderSection>
  );
};

export const Separator = styled(Icon)`
  line-height: 30px;
  font-size: 20px;
`;

const Crumb = styled.span`
  white-space: nowrap;
`;

export default HeaderBreadcrumb;
