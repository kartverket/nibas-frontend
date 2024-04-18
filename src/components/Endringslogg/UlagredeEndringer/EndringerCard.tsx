import { Badge, Card, Text } from "@kvib/react";
import { HistoryTypeValues } from "contexts/HistoryContext/types";
import { ReactNode } from "react";
import { styled } from "styled-components";
import { EndringFraTil } from "../EndringsloggComponents";
import { AbstractedHistoryEntry } from "../hooks/useUnsavedEndringer";

type EndringerProps = {
  type: HistoryTypeValues;
  endringer: AbstractedHistoryEntry[];
};

export const EndringerCard = ({ type, endringer }: EndringerProps) => {
  const { title, description } = getTitleAndDescriptionFragments(type, endringer);
  return (
    <Card padding={4} variant={"outline"}>
      {title}
      {description}
    </Card>
  );
};

const getTitleAndDescriptionFragments = (
  type: HistoryTypeValues,
  endringer: AbstractedHistoryEntry[],
): { title: ReactNode; description: ReactNode } => {
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
    <Container>
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
        }
      })}
    </Container>
  );
};

type KontekstWithBadgeProps = {
  kontekstEgenskaper: string;
  isNew: boolean;
  isReplaced: boolean;
  isUnchanged: boolean;
};

const DetailedKontekstEgenskaperEndringerList = ({ endringer }: DetailedEndringerPorps) => {
  const getFormattedKontekstEgenskaper = (objects: object[]) => {
    return objects.map((kontekstEgenskaper) => {
      if ("kretsNummer" in kontekstEgenskaper && "kretsNavn" in kontekstEgenskaper) {
        return `${kontekstEgenskaper.kretsNummer} ${kontekstEgenskaper.kretsNavn}`;
      } else return "Ukjent krets";
    });
  };

  const KontekstWithBadge = ({ kontekstEgenskaper, isNew, isReplaced, isUnchanged }: KontekstWithBadgeProps) => {
    return (
      <Container>
        <Text>{kontekstEgenskaper}</Text>
        {isNew ? (
          <Badge colorScheme="green">ny</Badge>
        ) : isReplaced ? (
          <Badge colorScheme="gray">utgår</Badge>
        ) : isUnchanged ? (
          <Badge colorScheme="green">består</Badge>
        ) : null}
      </Container>
    );
  };

  return (
    <Container>
      {endringer.map((endring, i) => {
        if (!Array.isArray(endring.from) || !Array.isArray(endring.to)) {
          return false;
        }

        const fraKonteksterFormatted = getFormattedKontekstEgenskaper(endring.from);
        const tilKonteksterFormatted = getFormattedKontekstEgenskaper(endring.to);

        const fraKonsteksterWithBadge = fraKonteksterFormatted.map((fraKontekst, index) => (
          <KontekstWithBadge
            key={index}
            kontekstEgenskaper={fraKontekst}
            isNew={false}
            isReplaced={!tilKonteksterFormatted.includes(fraKontekst)}
            isUnchanged={tilKonteksterFormatted.includes(fraKontekst)}
          />
        ));

        const tilKonteksterWithBadge = tilKonteksterFormatted.map((tilKontekst, index) => (
          <KontekstWithBadge
            key={index}
            kontekstEgenskaper={tilKontekst}
            isNew={!fraKonteksterFormatted.includes(tilKontekst)}
            isReplaced={false}
            isUnchanged={fraKonteksterFormatted.includes(tilKontekst)}
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
    </Container>
  );
};

const EndringTitle = styled(Text)`
  font-size: var(--kvib-fontSizes-sm);
  color: var(--kvib-color-gray-700);
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;
