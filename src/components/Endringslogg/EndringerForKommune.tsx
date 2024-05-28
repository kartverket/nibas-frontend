import { KretsendringerForKommune } from "components/Endringslogg/hooks/utkastEndringerTypes";
import { KontekstType } from "pages/Kart/OverlayPanels/hooks/tilhorighet-utils";
import { EndringerKommuneCardList } from "components/Endringslogg/EndringerKommuneCardList";
import { EndringListItem, ListHeading } from "components/Endringslogg/EndringerListComponents";

type EndringerForKommuneProps = {
  kretstype: KontekstType;
  endringer: KretsendringerForKommune;
};

const harEndringer = (endringer: KretsendringerForKommune) =>
  endringer.antallArkiverteGrenser > 0 ||
  endringer.antallNyeGrenser > 0 ||
  endringer.antallEndredeGrenser > 0 ||
  (endringer.delinger?.length ?? 0) !== 0 ||
  endringer.sammenslaaing != null ||
  endringer.metadataendringer.length > 0;

export const EndringerForKommune = ({ kretstype, endringer }: EndringerForKommuneProps) => {
  const titlePrefix = kretstype === "STEMMEKRETS" ? "Stemmekretsendringer" : "Grunnkretsendringer";

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
