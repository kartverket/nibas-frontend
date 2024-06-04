import { KommuneendringerForFylke } from "components/Endringslogg/hooks/utkastEndringerTypes";
import { EndringListItem, ListHeading } from "components/Endringslogg/EndringerListComponents";
import { EndringerFylkeCardList } from "components/Endringslogg/EndringerFylkeCardList";

type EndringerForFylkeProps = {
  endringer: KommuneendringerForFylke;
};

export const EndringerForFylke = ({ endringer }: EndringerForFylkeProps) => {
  if (endringer.kommuneendringer.length === 0) {
    return null;
  }

  return (
    <EndringListItem>
      <ListHeading as="h3">
        Kommuneendringer i {endringer.nummer} {endringer.navn}
      </ListHeading>
      <EndringerFylkeCardList endringer={endringer.kommuneendringer} />
    </EndringListItem>
  );
};
