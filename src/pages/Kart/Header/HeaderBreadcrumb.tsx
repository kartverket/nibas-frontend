import { Breadcrumb, BreadcrumbItem, Text } from "@kvib/react";
import Icon from "components/Icon";
import { useUtkast } from "contexts/UtkastContext";
import styled from "styled-components";

const HeaderBreadcrumb = () => {
  const { utkast } = useUtkast();
  if (!utkast) return null;
  return (
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
  );
};

const Separator = styled(Icon)`
  line-height: 30px;
  font-size: 20px;
`;

const Crumb = styled(Text).attrs({ noOfLines: 1 })``;

export default HeaderBreadcrumb;
