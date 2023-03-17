import { useTranslation } from "react-i18next";
import { Grunnkretsendringer } from "components/Endringslogg/hooks/utkastEndringerTypes";
import {
  EndringPanel,
  GrenseEndringerPanel,
} from "components/Endringslogg/EndringPanel";
import { Seksjonsheader } from "./EndringsloggStyles";

type EndringsloggGrunnkretsendringerProps = {
  endringer: Grunnkretsendringer;
};

export const EndringsloggGrunnkretsendringer = ({
  endringer,
}: EndringsloggGrunnkretsendringerProps) => {
  const { t } = useTranslation();

  return (
    <section>
      <Seksjonsheader>
        {t("utkast.endringslogg.grunnkrets-tittel", {
          kommune: endringer.kommune.navn,
        })}
      </Seksjonsheader>
      <EndringPanel
        tittel={t("utkast.endringslogg.endring.grunnkretsnavn")}
        endringer={endringer.navn}
      />
      <EndringPanel
        tittel={t("utkast.endringslogg.endring.grunnkretsnummer")}
        endringer={endringer.grunnkretsnummer}
      />
      <GrenseEndringerPanel
        tittel={t("utkast.endringslogg.endring.grenseendringer")}
        endringer={endringer.grensejusteringer.map(
          (endring) => `${endring.grunnkretsnummer} ${endring.navn}`
        )}
      />
    </section>
  );
};
