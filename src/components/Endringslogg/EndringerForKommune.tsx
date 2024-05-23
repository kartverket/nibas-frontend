import { Heading } from "@kvib/react";
import { KretsendringerForKommune } from "components/Endringslogg/hooks/utkastEndringerTypes";
import { styled } from "styled-components";
import { KontekstType } from "pages/Kart/OverlayPanels/hooks/tilhorighet-utils";
import { EndringerCardList } from "components/Endringslogg/EndringerCardList";

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
      <KommuneHeading as="h3">
        {titlePrefix} i {endringer.kommune.nummer} {endringer.kommune.navn}
      </KommuneHeading>
      <EndringerCardList endringer={endringer} />
    </EndringListItem>
  );
};

const KommuneHeading = styled(Heading)`
  font-size: var(--kvib-fontSizes-xl);
  font-weight: 900;
  margin-bottom: 1rem;
`;

export const EndringListItem = styled.li`
  padding-left: 50px;
  margin-left: -20px;
  padding-bottom: 2rem;
  position: relative;

  &:last-child {
    padding-bottom: 0;
    margin-bottom: 2rem;
  }

  &::before {
    content: "";
    background-color: var(--kvib-colors-gray-200);
    top: 9px;
    left: 25px;
    position: absolute;
    width: 2px;
    height: 100%;
  }

  &::after {
    content: "";
    position: absolute;
    left: 19px;
    top: 9px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background-color: var(--kvib-colors-gray-200);
  }
`;
