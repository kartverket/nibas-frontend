import {
  Kretsendringer,
  KretsendringerForKommune,
  KretsType,
} from "components/Endringslogg/hooks/utkastEndringerTypes";
import { EndringerKommuneCardList } from "components/Endringslogg/EndringerKommuneCardList";
import { EndringListItem, ListHeading } from "components/Endringslogg/EndringerListComponents";

type EndringerForKommuneProps = {
  kretstype: KretsType;
  endringer: KretsendringerForKommune;
};

export const harEndringer = (endringer: Kretsendringer) =>
  endringer.antallArkiverteGrenser > 0 ||
  endringer.antallNyeGrenser > 0 ||
  endringer.antallEndredeGrenser > 0 ||
  (endringer.delinger?.length ?? 0) !== 0 ||
  endringer.sammenslaaing != null ||
  endringer.metadataendringer.length > 0;

export const EndringerForKommune = ({ kretstype, endringer }: EndringerForKommuneProps) => {
  const titlePrefix =
    kretstype === KretsType.STEMMEKRETS
      ? "Stemmekretsendringer"
      : kretstype === KretsType.GRUNNKRETS
        ? "Grunnkretsendringer"
        : kretstype === KretsType.BOPLIKTOMRAADE
          ? "Bopliktområdeendringer"
          : kretstype + "endringer";

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
