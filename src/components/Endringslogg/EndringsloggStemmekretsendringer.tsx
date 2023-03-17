import { useTranslation } from "react-i18next";
import {
  StemmekretsEndring,
  Stemmekretsendringer,
} from "components/Endringslogg/hooks/utkastEndringerTypes";
import {
  EndringPanel,
  GrenseEndringerPanel,
} from "components/Endringslogg/EndringPanel";
import { Seksjonsheader } from "./EndringsloggStyles";

type EndringsloggStemmekretsendringerProps = {
  endringer: Stemmekretsendringer;
};

export const EndringsloggStemmekretsendringer = ({
  endringer,
}: EndringsloggStemmekretsendringerProps) => {
  const { t } = useTranslation();

  return (
    <section>
      <Seksjonsheader>
        {t("utkast.endringslogg.stemmekrets-tittel", {
          kommune: endringer.kommune.navn,
        })}
      </Seksjonsheader>
      <EndringPanel
        tittel={t("utkast.endringslogg.endring.stemmekretsnavn")}
        endringer={addStemmekretsnummerToEndringer(endringer.stemmekretsnavn)}
      />
      <EndringPanel
        tittel={t("utkast.endringslogg.endring.stemmekretsnummer")}
        endringer={addStemmekretsnavnToEndringer(endringer.stemmekretsnummer)}
      />
      <EndringPanel
        tittel={t("utkast.endringslogg.endring.tellekretsnavn")}
        endringer={addTellekretsnummerToEndringer(endringer.tellekretsnavn)}
      />
      <EndringPanel
        tittel={t("utkast.endringslogg.endring.tellekretsnummer")}
        endringer={addTellerkretanavnToEndringer(endringer.tellekretsnummer)}
      />
      <EndringPanel
        tittel={t("utkast.endringslogg.endring.valgdistriktsnummer")}
        endringer={addTellerkretanavnToEndringer(endringer.valgdistriktsnummer)}
      />
      <GrenseEndringerPanel
        tittel={t("utkast.endringslogg.endring.grenseendringer")}
        endringer={endringer.grensejusteringer.map(
          (endring) => `${endring.stemmekretsnummer} ${endring.stemmekretsnavn}`
        )}
      />
    </section>
  );
};

function addStemmekretsnummerToEndringer(
  endringer: StemmekretsEndring[]
): StemmekretsEndring[] {
  return endringer.map((endring) => ({
    ...endring,
    fra: `${endring.kretsEndret.stemmekretsnummer ?? ""} ${endring.fra}`,
    til: `${endring.kretsEndret.stemmekretsnummer ?? ""} ${endring.til}`,
  }));
}

function addStemmekretsnavnToEndringer(
  endringer: StemmekretsEndring[]
): StemmekretsEndring[] {
  return endringer.map((endring) => ({
    ...endring,
    fra: `${endring.fra} ${endring.kretsEndret.stemmekretsnavn ?? ""}`,
    til: `${endring.til} ${endring.kretsEndret.stemmekretsnavn ?? ""}`,
  }));
}

function addTellekretsnummerToEndringer(
  endringer: StemmekretsEndring[]
): StemmekretsEndring[] {
  return endringer.map((endring) => ({
    ...endring,
    fra: `${endring.kretsEndret.tellekretsnummer ?? ""} ${endring.fra}`,
    til: `${endring.kretsEndret.tellekretsnummer ?? ""} ${endring.til}`,
  }));
}

function addTellerkretanavnToEndringer(
  endringer: StemmekretsEndring[]
): StemmekretsEndring[] {
  return endringer.map((endring) => ({
    ...endring,
    fra: `${endring.fra ?? ""} ${endring.kretsEndret.tellekretsnavn ?? ""}`,
    til: `${endring.til ?? ""} ${endring.kretsEndret.tellekretsnavn ?? ""}`,
  }));
}
