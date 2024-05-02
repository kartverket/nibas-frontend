import { Heading } from "@kvib/react";
import { Kretsendringer, KretsType, Metadataendringer } from "components/Endringslogg/hooks/utkastEndringerTypes";
import { EndringNumericCard, EndringToFromCard } from "components/Endringslogg/Endringcard/EndringCard";
import { EndringListItem } from "components/Endringslogg/EndringerList";
import { styled } from "styled-components";
import { getNavnOgNummerChanges, getValgdistriktChanges } from "components/Endringslogg/Endringcard/EndringCardUtils";

type EndringerForKommuneProps<T extends KretsType> = {
  kretstype: T;
  endringer: Kretsendringer<Metadataendringer>;
};

const harEndringer = (endringer: Kretsendringer<Metadataendringer>) =>
  endringer.antallArkiverteGrenser > 0 ||
  endringer.antallNyeGrenser > 0 ||
  endringer.antallEndredeGrenser > 0 ||
  (endringer.delinger?.length ?? 0) !== 0 ||
  endringer.sammenslaaing != null ||
  endringer.metadataendringer.length > 0;

export const EndringerForKommune = <T extends KretsType>({ kretstype, endringer }: EndringerForKommuneProps<T>) => {
  const titlePrefix = kretstype === "STEMMEKRETS" ? "Stemmekretsendringer" : "Grunnkretsendringer";
  const { metadataendringer, antallArkiverteGrenser, antallEndredeGrenser, antallNyeGrenser, delinger, sammenslaaing } =
    endringer;

  if (!harEndringer(endringer)) {
    return null;
  }

  const navnOgNummerChanges = getNavnOgNummerChanges(metadataendringer);
  const valgdistriktEndringer = kretstype === "STEMMEKRETS" ? getValgdistriktChanges(metadataendringer) : [];

  return (
    <EndringListItem>
      <KommuneHeading as="h3">
        {titlePrefix} i {endringer.kommune.nummer} {endringer.kommune.navn}
      </KommuneHeading>
      <EndringToFromCard type="flatedetaljer" changes={navnOgNummerChanges} />
      <EndringToFromCard type="valgdistrikt" changes={valgdistriktEndringer} />
      {sammenslaaing != null && (
        <EndringToFromCard
          type="sammenslåing"
          changes={[
            {
              from: sammenslaaing.gamleKretser.map(({ navn, nummer }) => `${nummer} ${navn}`),
              to: [`${sammenslaaing.nyttNummer} ${sammenslaaing.nyttNavn}`],
            },
          ]}
        />
      )}
      {delinger != null && (
        <EndringToFromCard
          type="deling"
          changes={delinger.map((deling) => ({
            from: [`${deling.opprinneligKrets.kretsNummer} ${deling.opprinneligKrets.kretsNavn}`],
            to: deling.nyeKretser.map((krets) => `${krets.kretsNummer} ${krets.kretsNavn}`),
          }))}
        />
      )}
      <EndringNumericCard type="grenseendring" value={antallEndredeGrenser} />
      <EndringNumericCard type="nyegrenser" value={antallNyeGrenser} />
      <EndringNumericCard type="arkiveringer" value={antallArkiverteGrenser} />
    </EndringListItem>
  );
};

const KommuneHeading = styled(Heading)`
  font-size: var(--kvib-fontSizes-xl);
  font-weight: 900;
  margin-bottom: 1rem;
`;
