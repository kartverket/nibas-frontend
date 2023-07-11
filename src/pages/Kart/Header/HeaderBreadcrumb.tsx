import { Breadcrumb, BreadcrumbItem } from "@kvib/react";
import Icon from "components/Icon";
import { useUtkast } from "contexts/UtkastContext";
import styled from "styled-components";

const HeaderBreadcrumb = () => {
  const { utkast } = useUtkast();
  if (!utkast) return null;
  return (
    <Breadcrumb separator={<Separator icon="chevron_right" />} spacing={1}>
      <BreadcrumbItem>
        <span>Utkast</span>
      </BreadcrumbItem>
      <BreadcrumbItem>
        <span>{utkast.endringstype}</span>
      </BreadcrumbItem>
      <BreadcrumbItem>
        <span>{utkast.navn}</span>
      </BreadcrumbItem>
    </Breadcrumb>
  );
};

const Separator = styled(Icon)`
  line-height: 30px;
  font-size: 20px;
`;

export default HeaderBreadcrumb;
