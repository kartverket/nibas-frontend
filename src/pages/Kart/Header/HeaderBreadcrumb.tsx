import { Breadcrumb, BreadcrumbItem, Text, useDisclosure } from "@kvib/react";
import Icon from "components/Icon";
import { useUtkast } from "contexts/UtkastContext";
import styled from "styled-components";
import HeaderButton from "./HeaderButton";
import UtkastEndreModal from "components/Modals/UtkastEndreModal";
import HeaderHome from "./HeaderHome";

const HeaderBreadcrumb = () => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { utkast } = useUtkast();

  if (!utkast) return null;

  return (
    <Section>
      <HeaderHome />
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
        onClick={onOpen}
        labelIsHidden
      />
      <UtkastEndreModal isOpen={isOpen} onClose={onClose} utkast={utkast} />
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
