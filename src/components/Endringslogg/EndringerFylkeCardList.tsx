import { Kommuneendringer } from "components/Endringslogg/hooks/utkastEndringerTypes";
import { ChangeToFromRow, ChangeToFromRowNoBadge, EndringCard } from "components/Endringslogg/Endringcard/EndringCard";

type EndringerFylkeListProps = {
  endringer: Kommuneendringer[];
};
export const EndringerFylkeCardList = ({ endringer }: EndringerFylkeListProps) => {
  const addedSamiskForvaltningsomraade = endringer.filter((endring) => endring.samiskforvaltningsomraade === true);
  const removedSamiskForvalntningsomraade = endringer.filter((endring) => endring.samiskforvaltningsomraade === false);
  const nameChanges = endringer.filter((endring) => endring.nyttNavn != null);

  if (endringer.length === 0) {
    return null;
  }

  return (
    <EndringCard title="Endring av flatedetaljer">
      {nameChanges.map((namechange) => (
        <ChangeToFromRow
          key={namechange.nummer}
          from={[`${namechange.nummer} ${namechange.gammeltNavn}`]}
          to={[`${namechange.nummer} ${namechange.nyttNavn}`]}
        />
      ))}
      {addedSamiskForvaltningsomraade.map((endring) => (
        <ChangeToFromRowNoBadge
          key={endring.nummer}
          from={`${endring.nummer} ${endring.gammeltNavn}`}
          to={"Lagt til markering som samisk forvaltningsområde"}
        />
      ))}
      {removedSamiskForvalntningsomraade.map((endring) => (
        <ChangeToFromRowNoBadge
          key={endring.nummer}
          from={`${endring.nummer} ${endring.gammeltNavn}`}
          to={"Fjernet markering som samisk forvaltningsområde"}
        />
      ))}
    </EndringCard>
  );
};
