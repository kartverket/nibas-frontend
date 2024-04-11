import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, Hide, Icon, Text, useDisclosure } from "@kvib/react";
import { useUtkast } from "contexts/UtkastContext/UtkastContext";
import { styled } from "styled-components";
import HeaderButton, { HeaderSection } from "./HeaderButton";
import UtkastEndreModal from "components/Modals/UtkastEndreModal";
import HeaderHome from "./HeaderHome";
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
    "Du har endringer i utkastet som ikke er lagret",
    "Er du sikker på at du vil gå ut av utkastet? Dersom du lukker utkastet nå mister du alle ulagrede endringer.",
  );

  const handleHome = () => {
    if (canSave) {
      openModal();
    } else {
      navigate(routes.utkast);
    }
  };

  if (!utkast) return null;

  return (
    <HeaderSection>
      <HeaderHome />
      <Breadcrumb separator="">
        <CustomTooltip text="Gå tilbake til utkastoversikten" hasArrow>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={handleHome}>Utkast</BreadcrumbLink>
            <Separator icon="chevron_right" />
          </BreadcrumbItem>
        </CustomTooltip>
        <Hide below="xl">
          <BreadcrumbItem>
            <Crumb>{utkast.endringstype}</Crumb>
            <Separator icon="chevron_right" />
          </BreadcrumbItem>
        </Hide>
        <BreadcrumbItem>
          <Text noOfLines={1}>{utkast.navn}</Text>
        </BreadcrumbItem>
      </Breadcrumb>
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
