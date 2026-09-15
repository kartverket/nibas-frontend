import { Kretsendringer } from "components/Endringslogg/hooks/utkastEndringerTypes";
import { EndringNumericCard, EndringToFromCard, InndelingCard } from "components/Endringslogg/Endringcard/EndringCard";
import { getNavnOgNummerChanges } from "components/Endringslogg/Endringcard/EndringCardUtils";

type EndringerKommuneListProps = {
  endringer: Kretsendringer;
};
export const EndringerKommuneCardList = ({ endringer }: EndringerKommuneListProps) => {
  const {
    metadataendringer,
    antallArkiverteGrenser,
    antallEndredeGrenser,
    antallNyeGrenser,
    delinger,
    sammenslaaing,
    nyeInndelinger,
    arkiverteInndelinger,
  } = endringer;
  const navnOgNummerChanges = getNavnOgNummerChanges(metadataendringer);

  return (
    <>
      <EndringToFromCard type="flateinformasjon" changes={navnOgNummerChanges} />
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
      {nyeInndelinger.length > 0 &&
        nyeInndelinger.map(({ navn, nummer }, i) => (
          <InndelingCard key={i} navn={navn} nummer={nummer} handling="ny" />
        ))}
      {arkiverteInndelinger.length > 0 &&
        arkiverteInndelinger.map(({ navn, nummer }, i) => (
          <InndelingCard key={i} navn={navn} nummer={nummer} handling="utgår" />
        ))}
      <EndringNumericCard type="grenseendring" value={antallEndredeGrenser} />
      <EndringNumericCard type="nyegrenser" value={antallNyeGrenser} />
      <EndringNumericCard type="arkiveringer" value={antallArkiverteGrenser} />
    </>
  );
};
