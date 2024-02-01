import {
  Stemmekretsendringer,
  StemmekretsMetadataEndring,
  StemmekretsSammenslaaingEndring,
} from "components/Endringslogg/hooks/utkastEndringerTypes";
import {
  EndringSection,
  Endringsrad,
  EndringsradEndring,
  EndringsradLabel,
  EndringsradListItem,
  EndringstypeTag,
  EndringTekst,
  Seksjonsoverskrift,
  Underoverskrift,
} from "./EndringsloggComponents";
import { UnstyledList } from "../UnstyledList";
import { StemmekretsResponse } from "../../types/api";

type EndringsloggStemmekretsendringerProps = {
  endringer: Stemmekretsendringer;
};

export const EndringsloggStemmekretsendringer = ({ endringer }: EndringsloggStemmekretsendringerProps) => (
  <EndringSection>
    <Underoverskrift>{`Stemmekretser i ${endringer.kommune.nummer} ${endringer.kommune.navn}`}</Underoverskrift>
    <StemmekretsGrensejusteringer grendejusteringer={endringer.grensejusteringer} />
    {endringer.metadataendringer.map((metadataendring) => (
      <StemmekretsMetadataEndringer
        key={metadataendring.kretsEndret.id.lokalid.value}
        metadataendring={metadataendring}
      />
    ))}
    <StemmekretsSammenslaaing sammenslaaing={endringer.sammenslaaing} />
  </EndringSection>
);

type StemmekretsGrensejusteringerProps = {
  grendejusteringer: StemmekretsResponse[];
};

const StemmekretsGrensejusteringer = ({ grendejusteringer }: StemmekretsGrensejusteringerProps) => {
  if (grendejusteringer == null || grendejusteringer.length === 0) {
    return null;
  }

  return (
    <EndringSection>
      <Seksjonsoverskrift>Stemmekretser påvirket av grensejusteringer</Seksjonsoverskrift>
      <UnstyledList>
        {grendejusteringer.map((grensjustering) => (
          <EndringsradListItem key={grensjustering.id.lokalid.value}>
            {grensjustering.stemmekretsnummer} {grensjustering.stemmekretsnavn}
          </EndringsradListItem>
        ))}
      </UnstyledList>
    </EndringSection>
  );
};

type StemmekretsSammenslaaingProps = {
  sammenslaaing: StemmekretsSammenslaaingEndring | null;
};

const StemmekretsSammenslaaing = ({ sammenslaaing }: StemmekretsSammenslaaingProps) => {
  if (sammenslaaing == null) {
    return null;
  }

  const gamleKretser = [
    {
      navn: sammenslaaing.viderefoertKrets.stemmekretsnavn,
      nummer: sammenslaaing.viderefoertKrets.stemmekretsnummer,
    },
    ...sammenslaaing.gamleKretser,
  ];

  const endringNummer = {
    til: sammenslaaing.nyttNummer,
    fra: gamleKretser.map((krets) => krets.nummer).join(", "),
  };

  const endringNavn = {
    til: sammenslaaing.nyttNavn,
    fra: gamleKretser.map((krets) => krets.navn).join(", "),
  };

  return (
    <EndringSection>
      <Seksjonsoverskrift>
        <span>
          {sammenslaaing.nyttNummer} {sammenslaaing.nyttNavn}
        </span>
        <EndringstypeTag>Sammenslåing</EndringstypeTag>
      </Seksjonsoverskrift>
      <UnstyledList>
        <EndringsradListItem>
          <EndringsradLabel>Sammenslått</EndringsradLabel>
          <EndringsradEndring>
            <UnstyledList>
              {gamleKretser.map((gammelKrets) => (
                <li key={gammelKrets.nummer}>
                  <EndringTekst $isBold={true}>
                    {gammelKrets.nummer} {gammelKrets.navn}
                  </EndringTekst>
                </li>
              ))}
            </UnstyledList>
          </EndringsradEndring>
        </EndringsradListItem>
        <Endringsrad tittel="Stemmekretsnummer" endring={endringNummer} />
        <Endringsrad tittel="Stemmekretsnavn" endring={endringNavn} />
      </UnstyledList>
    </EndringSection>
  );
};

type StemmekretsMetadataEndringerProps = {
  metadataendring: StemmekretsMetadataEndring;
};

const StemmekretsMetadataEndringer = ({ metadataendring }: StemmekretsMetadataEndringerProps) => {
  const navn = metadataendring.stemmekretsnavn?.til ?? metadataendring.kretsEndret.stemmekretsnavn;
  const nummer = metadataendring.stemmekretsnummer?.til ?? metadataendring.kretsEndret.stemmekretsnummer;

  return (
    <EndringSection>
      <Seksjonsoverskrift>
        <span>
          {navn} {nummer}
        </span>
        <EndringstypeTag>Metadataendringer</EndringstypeTag>
      </Seksjonsoverskrift>
      <UnstyledList>
        {metadataendring.stemmekretsnavn && (
          <Endringsrad tittel="Stemmekretsnavn" endring={metadataendring.stemmekretsnavn} />
        )}
        {metadataendring.stemmekretsnummer && (
          <Endringsrad tittel="Stemmekretsnummer" endring={metadataendring.stemmekretsnummer} />
        )}
        {metadataendring.valgdistriktsnummer && (
          <Endringsrad tittel="Valgdistriktsnummer" endring={metadataendring.valgdistriktsnummer} />
        )}
      </UnstyledList>
    </EndringSection>
  );
};
