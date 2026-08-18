import {
  Kretsendringer,
  KretsendringerForKommune,
  EndringsloggInndelingType,
} from "components/Endringslogg/hooks/utkastEndringerTypes";
import { EndringerKommuneCardList } from "components/Endringslogg/EndringerKommuneCardList";
import { EndringListItem, ListHeading } from "components/Endringslogg/EndringerListComponents";

type EndringerForKommuneProps = {
  inndelingType: EndringsloggInndelingType;
  endringer: KretsendringerForKommune;
};

export const harEndringer = (endringer: Kretsendringer) =>
  endringer.antallArkiverteGrenser > 0 ||
  endringer.antallNyeGrenser > 0 ||
  endringer.antallEndredeGrenser > 0 ||
  (endringer.delinger?.length ?? 0) !== 0 ||
  endringer.sammenslaaing != null ||
  endringer.metadataendringer.length > 0 ||
  endringer.nyeInndelinger.length > 0;

export const EndringerForKommune = ({ inndelingType, endringer }: EndringerForKommuneProps) => {
  const titlePrefix =
    inndelingType === "STEMMEKRETS"
      ? "Stemmekretsendringer"
      : inndelingType === "GRUNNKRETS"
        ? "Grunnkretsendringer"
        : inndelingType === "BOPLIKTOMRAADE"
          ? "Bopliktområdeendringer"
          : inndelingType + "endringer";

  if (!harEndringer(endringer)) {
    return null;
  }

  return (
    <EndringListItem>
      <ListHeading as="h3">
        {titlePrefix} i {endringer.kommune.nummer} {endringer.kommune.navn}
      </ListHeading>
      <EndringerKommuneCardList endringer={endringer} />
    </EndringListItem>
  );
};
