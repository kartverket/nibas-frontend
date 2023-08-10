import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import {
  Heading,
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuList,
  Text,
} from "@kvib/react";
import Icon from "components/Icon";
import { getDateInFriendlyString } from "pages/Kart/OverlayPanels/MetadataPanel/utils";
import { UtkastResponse } from "types/api";
import UtkastSlett from "./UtkastSlett";
import UtkastPubliser from "./UtkastPubliser";
import UtkastEndringslogg from "./UtkastEndringslogg";
import UtkastEndre from "./UtkastEndre";

const UtkastCard = ({ utkast }: { utkast: UtkastResponse }) => {
  const navigate = useNavigate();

  return (
    <Container role="link" onClick={() => navigate(utkast.id)}>
      <Info>
        <Heading as="h3" size="sm">
          {utkast.navn}
        </Heading>
        <Date fontSize="xs">
          {`Opprettet: ${getDateInFriendlyString(utkast.opprettetDato)}`}
        </Date>
      </Info>
      <Menu>
        <MenuButton
          as={IconButton}
          onClick={(e) => e.stopPropagation()}
          aria-label="Flere alternativer"
          icon={<Icon icon="more_horiz" />}
          variant="ghost"
        />
        <MenuList>
          <UtkastEndre utkast={utkast} />
          <UtkastEndringslogg utkast={utkast} />
          <MenuDivider />
          <UtkastPubliser utkast={utkast} />
          <UtkastSlett utkast={utkast} />
        </MenuList>
      </Menu>
    </Container>
  );
};

const Container = styled.article`
  display: flex;
  justify-content: space-between;
  padding: 24px;
  border-radius: 8px;
  background: var(--kvib-colors-chakra-body-bg);
  box-shadow: var(--kvib-shadows-base);
  border: 2px solid transparent;
  transition: border-color 0.1s;
  cursor: pointer;

  &:hover {
    border-color: var(--kvib-colors-blue-500);
  }
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Date = styled(Text)`
  font-size: var(--kvib-fontSizes-xs);
  color: var(--kvib-colors-gray-500);
`;

export default UtkastCard;
