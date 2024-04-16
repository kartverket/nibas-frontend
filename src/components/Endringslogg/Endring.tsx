import { Card, Stack, Text } from "@kvib/react";
import { HistoryTypeValues } from "contexts/HistoryContext/types";
import { styled } from "styled-components";
import { EndringFraTil } from "./EndringsloggComponents";
import { MinimalHistoryEntry } from "./UlagredeEndringer";
import { KontekstEgenskaper } from "types/api";

type EndringerProps = {
  type: HistoryTypeValues;
  endringer: MinimalHistoryEntry[];
};

export const Endringer = ({ type, endringer }: EndringerProps) => {
  const { title, description } = getTitleAndDescriptionFragments(type, endringer);
  return (
    <Card padding={4} variant={"outline"}>
      <Stack>
        {title}
        {description}
      </Stack>
    </Card>
  );
};

type DetailedEndringerPorps = Pick<EndringerProps, "endringer">;

const DetailedFlateEndringerList = ({ endringer }: DetailedEndringerPorps) => {
  return (
    <Stack>
      {endringer.map((endring, i) => {
        const fraFlate = endring.from;
        const tilFlate = endring.to;
        if (("navn" && "nummer") in fraFlate && ("navn" && "nummer") in tilFlate) {
          return (
            <EndringFraTil
              key={i}
              endring={{ fra: `${fraFlate.nummer} ${fraFlate.navn}`, til: `${tilFlate.nummer} ${tilFlate.navn}` }}
            />
          );
        } else return null;
      })}
    </Stack>
  );
};

const DetailedKontekstEgenskaperEndringerList = ({ endringer }: DetailedEndringerPorps) => {
  const getFormattedKontekstEgenskaper = (kontekstEgenskaper: KontekstEgenskaper[]) => {
    return kontekstEgenskaper.map((kontekst) => `${kontekst.kretsNummer} ${kontekst.kretsNavn}`).join(", ");
  };

  return (
    <Stack>
      {endringer.map((endring, i) => {
        const fraKontekster = endring.from as KontekstEgenskaper[];
        const tilKontekster = endring.to as KontekstEgenskaper[];
        return (
          <EndringFraTil
            key={i}
            endring={{
              fra: getFormattedKontekstEgenskaper(fraKontekster),
              til: getFormattedKontekstEgenskaper(tilKontekster),
            }}
          />
        );
      })}
    </Stack>
  );
};

const getTitleAndDescriptionFragments = (
  type: HistoryTypeValues,
  endringer: MinimalHistoryEntry[],
): { title: JSX.Element; description: JSX.Element } => {
  const antallEndringer = endringer.length;

  switch (type) {
    case "grense":
      return {
        title: <EndringTitle>Justering på grenser</EndringTitle>,
        description: (
          <Text>
            {antallEndringer <= 1 ? `${antallEndringer} grense` : `${antallEndringer} grenser`} har blitt endret på
          </Text>
        ),
      };
    case "property":
      return {
        title: <EndringTitle>Informasjon om grenser</EndringTitle>,
        description: (
          <Text>
            {antallEndringer <= 1 ? `${antallEndringer} grense` : `${antallEndringer} grenser`} har fått endret
            informasjon
          </Text>
        ),
      };
    case "grunnkrets":
      return {
        title: <EndringTitle>Endring på grunnkretser</EndringTitle>,
        description: <DetailedFlateEndringerList endringer={endringer} />,
      };
    case "stemmekrets":
      return {
        title: <EndringTitle>Endring på stemmekretser</EndringTitle>,
        description: <DetailedFlateEndringerList endringer={endringer} />,
      };
    case "utkast":
      return {
        title: <EndringTitle>Endringer på utkast</EndringTitle>,
        description: (
          <Text>
            {antallEndringer <= 1 ? `${antallEndringer} endring` : `${antallEndringer} endringer`} er gjort på utkastet
          </Text>
        ),
      };
    case "stemmekretssammenslaaingsendring":
      return {
        title: <EndringTitle>Stemmekretssammenslåing</EndringTitle>,
        description: (
          <Text>
            {antallEndringer <= 1 ? `${antallEndringer} sammenslåing` : `${antallEndringer} sammenslåinger`} har blitt
            utført
          </Text>
        ),
      };
    case "grensearkivering":
      return {
        title: <EndringTitle>Arkiverte grenser</EndringTitle>,
        description: (
          <Text>
            {antallEndringer <= 1 ? `${antallEndringer} grense` : `${antallEndringer} grenser`} har blitt arkivert
          </Text>
        ),
      };
    case "grensetilhorighetendring":
      return {
        title: <EndringTitle>Tilhørighetendringer på grenser</EndringTitle>,
        description: <DetailedKontekstEgenskaperEndringerList endringer={endringer} />,
      };
    case "nygrense":
      return {
        title: <EndringTitle>Nye grenser</EndringTitle>,
        description: (
          <Text>
            {antallEndringer <= 1 ? `${antallEndringer} ny grense` : `${antallEndringer} nye grenser`} har blitt
            opprettet
          </Text>
        ),
      };
    case "grensedeling":
      return {
        title: <EndringTitle>Delte grenser</EndringTitle>,
        description: (
          <Text>
            {antallEndringer <= 1 ? `${antallEndringer} grense` : `${antallEndringer} grenser`} har blitt delt
          </Text>
        ),
      };
  }
};

const EndringTitle = styled(Text)`
  font-size: small;
  color: var(--kvib-color-gray-700);
`;
