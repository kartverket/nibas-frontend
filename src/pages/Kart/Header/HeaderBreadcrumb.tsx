import { Breadcrumb, BreadcrumbItem, Text } from "@kvib/react";
import Icon from "components/Icon";
import { useUtkast } from "contexts/UtkastContext";
import styled from "styled-components";
import HeaderButton from "./HeaderButton";
import { routes } from "utils/routes";
import { useNavigate } from "react-router-dom";

const HeaderBreadcrumb = () => {
  const navigate = useNavigate();
  const { utkast } = useUtkast();
  if (!utkast) return null;
  return (
    <Section>
      <HeaderButton
        label="Utkast"
        icon="home"
        onClick={() => navigate(routes.utkast)}
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
