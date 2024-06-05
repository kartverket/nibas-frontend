import { Kretsendringer } from "components/Endringslogg/hooks/utkastEndringerTypes";
import { EndringerKommuneCardList } from "components/Endringslogg/EndringerKommuneCardList";
import { EndringListItem, ListHeading } from "components/Endringslogg/EndringerListComponents";
import { Icon } from "@kvib/react";
import { harEndringer } from "components/Endringslogg/EndringerForKommune";
import { styled } from "styled-components";

type EndringerUtenTilhorighetProps = {
  endringer: Kretsendringer;
};

export const EndringerUtenTilhorighet = ({ endringer }: EndringerUtenTilhorighetProps) => {
  if (!harEndringer(endringer)) {
    return null;
  }

  return (
    <EndringListItem>
      <ListHeading as="h3">
        Endringer uten tilhørighet <StyledIcon icon="warning" size={24} isFilled={true} color="orange" />
      </ListHeading>
      <EndringerKommuneCardList endringer={endringer} />
    </EndringListItem>
  );
};

const StyledIcon = styled(Icon)`
  margin-left: 4px;
`;
