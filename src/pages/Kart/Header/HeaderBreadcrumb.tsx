import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Text,
  useDisclosure,
} from "@kvib/react";
import Icon from "components/Icon";
import { useUtkast } from "contexts/UtkastContext";
import styled from "styled-components";
import HeaderButton from "./HeaderButton";
import UtkastEndreModal from "components/Modals/UtkastEndreModal";
import HeaderHome from "./HeaderHome";
import { Link } from "react-router-dom";
import { routes } from "utils/routes";

const HeaderBreadcrumb = () => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { utkast } = useUtkast();

  if (!utkast) return null;

  return (
    <Section>
      <HeaderHome />
      <Breadcrumb separator={<Separator icon="chevron_right" />} spacing={1}>
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to={routes.utkast}>
            Utkast
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <Crumb>{utkast.endringstype}</Crumb>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <Text noOfLines={1}>{utkast.navn}</Text>
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

const Crumb = styled.span`
  white-space: nowrap;
`;

export default HeaderBreadcrumb;
