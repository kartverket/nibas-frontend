import { Breadcrumb, BreadcrumbItem, Text } from "@kvib/react";
import Icon from "components/Icon";
import { useUtkast } from "contexts/UtkastContext";
import styled from "styled-components";
import HeaderButton from "./HeaderButton";
import AlertModal from "components/AlertModal";
import useAlertModal from "hooks/useAlertModal";
import { useToolbar } from "contexts/ToolbarContext";
import { useKeyboardShortcut } from "hooks/keyboard-shortcuts/keyboard-shortcuts-hook";

const HeaderBreadcrumb = () => {
  const { utkast, closeUtkast } = useUtkast();
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
  if (!utkast) return null;

  return (
    <Section>
      <HeaderButton
        label="Utkast"
        icon="home"
        onClick={handleHome}
        labelIsHidden
      />
      <Breadcrumb separator={<Separator icon="chevron_right" />} spacing={1}>
        <BreadcrumbItem>
          <Crumb>Utkast</Crumb>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <Crumb>{utkast.endringstype}</Crumb>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <Crumb>{utkast.navn}</Crumb>
        </BreadcrumbItem>
      </Breadcrumb>
      <HeaderButton
        label="Rediger utkast"
        icon="edit_note"
        onClick={() => console.log("TODO")}
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
    </Section>
  );
};

const Section = styled.section`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Separator = styled(Icon)`
  line-height: 30px;
  font-size: 20px;
`;

const Crumb = styled(Text).attrs({ noOfLines: 1 })``;

export default HeaderBreadcrumb;
