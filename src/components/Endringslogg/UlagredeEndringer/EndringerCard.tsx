import { Badge, Card, Stack, Text } from "@kvib/react";
import { HistoryTypeValues } from "contexts/HistoryContext/types";
import { styled } from "styled-components";
import { Container, EndringFraTil } from "../EndringsloggComponents";
import { KontekstEgenskaper } from "types/api";
import { AbstrahertHistroyEntry } from "../hooks/useUlagredeEndringer";

type EndringerProps = {
  type: HistoryTypeValues;
  endringer: AbstrahertHistroyEntry[];
};

export const EndringerCard = ({ type, endringer }: EndringerProps) => {
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

const getTitleAndDescriptionFragments = (
  type: HistoryTypeValues,
  endringer: AbstrahertHistroyEntry[],
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
              withBadges
            />
          );
        } else return null;
      })}
    </Stack>
  );
};

type KontekstWithBadgeProps = {
  kontekst: string;
  erNy: boolean;
  erErstattet: boolean;
  erUendret: boolean;
};

const DetailedKontekstEgenskaperEndringerList = ({ endringer }: DetailedEndringerPorps) => {
  const getFormattedKontekstEgenskaper = (kontekstEgenskaper: KontekstEgenskaper[]) => {
    return kontekstEgenskaper.map((kontekst) => `${kontekst.kretsNummer} ${kontekst.kretsNavn}`);
  };

  const KontekstWithBadge = ({ kontekst, erNy, erErstattet, erUendret }: KontekstWithBadgeProps) => {
    return (
      <div>
        <Container>
          <Text>{kontekst}</Text>
          {erNy ? (
            <Badge colorScheme="green">ny</Badge>
          ) : erErstattet ? (
            <Badge colorScheme={"gray"}>utgår</Badge>
          ) : erUendret ? (
            <Badge colorScheme={"green"}>består</Badge>
          ) : null}
        </Container>
      </div>
    );
  };

  return (
    <Stack>
      {endringer.map((endring, i) => {
        const fraKontekster = endring.from as KontekstEgenskaper[];
        const tilKontekster = endring.to as KontekstEgenskaper[];

        const fraKonteksterFormatted = getFormattedKontekstEgenskaper(fraKontekster);
        const tilKonteksterFormatted = getFormattedKontekstEgenskaper(tilKontekster);

        const fraKonsteksterWithBadge = fraKonteksterFormatted.map((fraKontekst, index) => (
          <KontekstWithBadge
            key={index}
            kontekst={fraKontekst}
            erNy={false}
            erErstattet={!tilKonteksterFormatted.includes(fraKontekst)}
            erUendret={tilKonteksterFormatted.includes(fraKontekst)}
          />
        ));

        const tilKonteksterWithBadge = tilKonteksterFormatted.map((tilKontekst, index) => (
          <KontekstWithBadge
            key={index}
            kontekst={tilKontekst}
            erNy={!fraKonteksterFormatted.includes(tilKontekst)}
            erErstattet={false}
            erUendret={fraKonteksterFormatted.includes(tilKontekst)}
          />
        ));

        return (
          <EndringFraTil
            key={i}
            endring={{
              fra: fraKonsteksterWithBadge,
              til: tilKonteksterWithBadge,
            }}
          />
        );
      })}
    </Stack>
  );
};

const EndringTitle = styled(Text)`
  font-size: small;
  color: var(--kvib-color-gray-700);
`;
