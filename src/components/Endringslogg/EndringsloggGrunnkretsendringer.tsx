import { useTranslation } from "react-i18next";
import {
  Grunnkretsendringer,
  GrunnkretsMetadataEndring,
} from "components/Endringslogg/hooks/utkastEndringerTypes";
import {
  EndringSection,
  Endringsrad,
  EndringsradListItem,
  EndringstypeTag,
  Seksjonsoverskrift,
  Underoverskrift,
} from "./EndringsloggComponents";
import { GrunnkretsResponse } from "../../types/api";
import { UnstyledList } from "../UnstyledList";

type EndringsloggGrunnkretsendringerProps = {
  endringer: Grunnkretsendringer;
};

export const EndringsloggGrunnkretsendringer = ({
  endringer,
}: EndringsloggGrunnkretsendringerProps) => {
  const { t } = useTranslation();

  return (
    <EndringSection>
      <Underoverskrift>
        {t("utkast.endringslogg.grunnkrets-tittel", {
          kommune: `${endringer.kommune.nummer} ${endringer.kommune.navn}`,
        })}
      </Underoverskrift>
      <GrunnkretsGrensejusteringer
        grendejusteringer={endringer.grensejusteringer}
      />
      {endringer.metadataendringer.map((metadataendring) => (
        <GrunnkretsMetadataEndringer
          key={metadataendring.kretsEndret.id.lokalid.value}
          metadataendring={metadataendring}
        />
      ))}
    </EndringSection>
  );
};

type GrunnkretsGrensejusteringerProps = {
  grendejusteringer: GrunnkretsResponse[];
};

const GrunnkretsGrensejusteringer = ({
  grendejusteringer,
}: GrunnkretsGrensejusteringerProps) => {
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
            {grensjustering.grunnkretsnummer} {grensjustering.navn}
          </EndringsradListItem>
        ))}
      </UnstyledList>
    </EndringSection>
  );
};

type GrunnkretsMetadataEndringerProps = {
  metadataendring: GrunnkretsMetadataEndring;
};

const GrunnkretsMetadataEndringer = ({
  metadataendring,
}: GrunnkretsMetadataEndringerProps) => {
  const { t } = useTranslation();
  const navn = metadataendring.navn?.til ?? metadataendring.kretsEndret.navn;
  const nummer =
    metadataendring.grunnkretsnummer?.til ??
    metadataendring.kretsEndret.grunnkretsnummer;

  return (
    <EndringSection>
      <Seksjonsoverskrift>
        <span>
          {navn} {nummer}
        </span>
        <EndringstypeTag>{t("utkast.endringslogg.metadata")}</EndringstypeTag>
      </Seksjonsoverskrift>
      <UnstyledList>
        {metadataendring.navn && (
          <Endringsrad
            tittel={t("utkast.endringslogg.endring.grunnkretsnavn")}
            endring={metadataendring.navn}
          />
        )}
        {metadataendring.grunnkretsnummer && (
          <Endringsrad
            tittel={t("utkast.endringslogg.endring.grunnkretsnummer")}
            endring={metadataendring.grunnkretsnummer}
          />
        )}
      </UnstyledList>
    </EndringSection>
  );
};
