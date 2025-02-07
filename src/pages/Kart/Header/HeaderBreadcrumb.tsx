import { Button, Divider, Icon, Text } from "@kvib/react";
import AlertModal from "components/Modals/AlertModal";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { useUtkast } from "contexts/UtkastContext/UtkastContext";
import useAlertModal from "hooks/useAlertModal";
import { useNavigate } from "react-router-dom";
import { styled } from "styled-components";
import { routes } from "utils/routes";
import CustomTooltip from "../Toolbar/CustomTooltip";
import { HeaderSection } from "./HeaderButton";

const HeaderBreadcrumb = () => {
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
          Se alle utkast
        </Button>
      </CustomTooltip>
      <Divider marginLeft="8px" orientation="vertical" />
      <Text paddingLeft="14px" noOfLines={1}>
        {utkast.navn}
      </Text>
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

export default HeaderBreadcrumb;
