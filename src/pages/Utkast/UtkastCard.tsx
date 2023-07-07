import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import {
  Heading,
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
} from "@kvib/react";
import Icon from "components/Icon";
import { getDateInFriendlyString } from "pages/Kart/OverlayPanels/MetadataPanel/utils";
import { UtkastResponse } from "types/api";
import UtkastDelete from "./UtkastDelete";
import UtkastPubliser from "./UtkastPubliser";

const UtkastCard = ({ utkast }: { utkast: UtkastResponse }) => {
  const navigate = useNavigate();

  return (
    <Container aria-role="button" onClick={() => navigate(utkast.id)}>
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
          <MenuItem icon={<Icon icon="edit" />}>TODO: Endre detaljer</MenuItem>
          <MenuItem icon={<Icon icon="published_with_changes" />}>
            TODO: Se endringslogg
          </MenuItem>
          <MenuDivider />
          <UtkastPubliser utkast={utkast} />
          <UtkastDelete utkast={utkast} />
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
