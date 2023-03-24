import { useTranslation } from "react-i18next";
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

export const EndringsloggStemmekretsendringer = ({
  endringer,
}: EndringsloggStemmekretsendringerProps) => {
  const { t } = useTranslation();

  return (
    <EndringSection>
      <Underoverskrift>
        {t("utkast.endringslogg.stemmekrets-tittel", {
          kommune: `${endringer.kommune.nummer} ${endringer.kommune.navn}`,
        })}
      </Underoverskrift>
      <StemmekretsGrensejusteringer
        grendejusteringer={endringer.grensejusteringer}
      />
      {endringer.metadataendringer.map((metadataendring) => (
        <StemmekretsMetadataEndringer
          key={metadataendring.kretsEndret.id.lokalid.value}
          metadataendring={metadataendring}
        />
      ))}
      <StemmekretsSammenslaaing sammenslaaing={endringer.sammenslaaing} />
    </EndringSection>
  );
};

type StemmekretsGrensejusteringerProps = {
  grendejusteringer: StemmekretsResponse[];
};

const StemmekretsGrensejusteringer = ({
  grendejusteringer,
}: StemmekretsGrensejusteringerProps) => {
  const { t } = useTranslation();

  if (grendejusteringer == null || grendejusteringer.length === 0) {
    return null;
  }

  return (
    <EndringSection>
      <Seksjonsoverskrift>
        {t("utkast.endringslogg.endring.grenseendringer")}
      </Seksjonsoverskrift>
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

const StemmekretsSammenslaaing = ({
  sammenslaaing,
}: StemmekretsSammenslaaingProps) => {
  const { t } = useTranslation();

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
          {sammenslaaing.viderefoertKrets.stemmekretsnummer}{" "}
          {sammenslaaing.viderefoertKrets.stemmekretsnavn}
        </span>
        <EndringstypeTag>
          {t("utkast.endringslogg.endring.sammenslaaing.tittel")}
        </EndringstypeTag>
      </Seksjonsoverskrift>
      <UnstyledList>
        <EndringsradListItem>
          <EndringsradLabel>
            {t("utkast.endringslogg.endring.sammenslaaing.sammenslatt")}
          </EndringsradLabel>
          <EndringsradEndring>
            <UnstyledList>
              {gamleKretser.map((gammelKrets) => (
                <li key={gammelKrets.nummer}>
                  <EndringTekst bold={true}>
                    {gammelKrets.nummer} {gammelKrets.navn}
                  </EndringTekst>
                </li>
              ))}
            </UnstyledList>
          </EndringsradEndring>
        </EndringsradListItem>
        <Endringsrad
          tittel={t(
            "utkast.endringslogg.endring.sammenslaaing.stemmekretsnummer"
          )}
          endring={endringNummer}
        />
        <Endringsrad
          tittel={t(
            "utkast.endringslogg.endring.sammenslaaing.stemmekretsnavn"
          )}
          endring={endringNavn}
        />
      </UnstyledList>
    </EndringSection>
  );
};

type StemmekretsMetadataEndringerProps = {
  metadataendring: StemmekretsMetadataEndring;
};

const StemmekretsMetadataEndringer = ({
  metadataendring,
}: StemmekretsMetadataEndringerProps) => {
  const { t } = useTranslation();

  return (
    <EndringSection>
      <Seksjonsoverskrift>
        <span>
          {metadataendring.kretsEndret.stemmekretsnummer}{" "}
          {metadataendring.kretsEndret.stemmekretsnavn}
        </span>
        <EndringstypeTag>{t("utkast.endringslogg.metadata")}</EndringstypeTag>
      </Seksjonsoverskrift>
      <UnstyledList>
        {metadataendring.stemmekretsnavn && (
          <Endringsrad
            tittel={t("utkast.endringslogg.endring.stemmekretsnavn")}
            endring={metadataendring.stemmekretsnavn}
          />
        )}
        {metadataendring.stemmekretsnummer && (
          <Endringsrad
            tittel={t("utkast.endringslogg.endring.stemmekretsnummer")}
            endring={metadataendring.stemmekretsnummer}
          />
        )}
        {metadataendring.tellekretsnavn && (
          <Endringsrad
            tittel={t("utkast.endringslogg.endring.tellekretsnavn")}
            endring={metadataendring.tellekretsnavn}
          />
        )}
        {metadataendring.tellekretsnummer && (
          <Endringsrad
            tittel={t("utkast.endringslogg.endring.tellekretsnummer")}
            endring={metadataendring.tellekretsnummer}
          />
        )}
        {metadataendring.valgdistriktsnummer && (
          <Endringsrad
            tittel={t("utkast.endringslogg.endring.valgdistriktsnummer")}
            endring={metadataendring.valgdistriktsnummer}
          />
        )}
      </UnstyledList>
    </EndringSection>
  );
};
