import { Badge, Card, Icon, Text } from "@kvib/react";
import { useAuthentication } from "components/Authentication/AuthenticationHook";
import { HistoryTypeValues } from "contexts/HistoryContext/types";
import { useUtkast } from "contexts/UtkastContext/UtkastContext";
import { ReactNode, useEffect, useState } from "react";
import { styled } from "styled-components";
import { getUrlForPath } from "utils/api";
import { removeNil } from "utils/list-utils";
import { AbstractedHistoryEntry } from "../hooks/useUnsavedEndringer";
import {
  getBodyTextForNumericChange,
  getTitleForEndringstype,
} from "components/Endringslogg/Endringcard/EndringCardUtils";

type Endring = {
  fra: ReactNode;
  til: ReactNode;
};

type EndringerProps = {
  type: HistoryTypeValues;
  endringer: AbstractedHistoryEntry[];
};

export const EndringerCard = ({ type, endringer }: EndringerProps) => {
  const { title, description } = getTitleAndDescriptionFragments(type, endringer);
  return (
    <EndringCard variant={"outline"}>
      {title}
      {description}
    </EndringCard>
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
        title: <EndringTitle>{getTitleForEndringstype("grenseendring")}</EndringTitle>,
        description: <Text>{getBodyTextForNumericChange(antallEndringer, "grenseendring")}</Text>,
      };
    case "property":
      return {
        title: <EndringTitle>{getTitleForEndringstype("grenseinformasjon")}</EndringTitle>,
        description: <Text>{getBodyTextForNumericChange(antallEndringer, "grenseinformasjon")}</Text>,
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
        title: <EndringTitle>{getTitleForEndringstype("sammenslåing")}</EndringTitle>,
        description: (
          <Text>
            {antallEndringer <= 1 ? `${antallEndringer} sammenslåing` : `${antallEndringer} sammenslåinger`} har blitt
            utført
          </Text>
        ),
      };
    case "grensearkivering":
      return {
        title: <EndringTitle>{getTitleForEndringstype("arkiveringer")}</EndringTitle>,
        description: <Text>{getBodyTextForNumericChange(antallEndringer, "arkiveringer")}</Text>,
      };
    case "grensetilhorighetendring":
      return {
        title: <EndringTitle>Tilhørighetendringer på grenser</EndringTitle>,
        description: <DetailedKontekstEgenskaperEndringerList endringer={endringer} />,
      };
    case "nygrense":
      return {
        title: <EndringTitle>{getTitleForEndringstype("nyegrenser")}</EndringTitle>,
        description: <Text>{getBodyTextForNumericChange(antallEndringer, "nyegrenser")}</Text>,
      };
    case "grensedeling":
      return {
        title: <EndringTitle>{getTitleForEndringstype("deling")}</EndringTitle>,
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
  const [kontekstDataForEndringer, setKontekstDataForEndringer] =
    useState<{ kretsNummer: unknown; kretsNavn: unknown }[]>();
  const auth = useAuthentication();
  const { utkast } = useUtkast();

  useEffect(() => {
    const getKontekstEgenskaperMetadata = async (tilhorighetEndringer: AbstractedHistoryEntry[]) => {
      return Promise.all(
        tilhorighetEndringer.flatMap((tilhorighetEndring) => {
          if (!Array.isArray(tilhorighetEndring.from) || !Array.isArray(tilhorighetEndring.to)) {
            return null;
          }
          const fromKontekstEgenskaper = tilhorighetEndring.from;
          const toKontekstEgenskaper = tilhorighetEndring.to;

          return fromKontekstEgenskaper.concat(toKontekstEgenskaper).map((kontekstEgenskaper) => {
            if ("id" in kontekstEgenskaper && "type" in kontekstEgenskaper && "kommuneId" in kontekstEgenskaper) {
              const lokalid = kontekstEgenskaper.id?.lokalid.value;
              const pathType =
                kontekstEgenskaper.type === "GRUNNKRETS"
                  ? "grunnkretser"
                  : kontekstEgenskaper.type === "STEMMEKRETS"
                    ? "stemmekretser"
                    : null;
              const kommuneLokalid = kontekstEgenskaper.kommuneId?.lokalid.value;
              if (lokalid !== undefined && pathType !== null) {
                return fetch(getUrlForPath(`v1/${pathType}/${lokalid}`), {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + auth.token,
                  },
                })
                  .then((response) => response.json())
                  .then((krets) => {
                    if ("navn" in krets && "nummer" in krets) {
                      return { kretsNavn: krets.navn, kretsNummer: krets.nummer };
                    }
                  });
              } else if (lokalid === undefined && kommuneLokalid !== null) {
                const nyeKretser = utkast?.operasjoner.kretsDelingEndringer
                  .filter((kretsDeling) => kretsDeling.kommuneId.lokalid.value === kommuneLokalid)
                  .flatMap((kretsDeling) => kretsDeling.nyeKretser);
                return nyeKretser?.find((krets) => krets.kretsNummer === kontekstEgenskaper.kretsNummer);
              }
            }
          });
        }),
      );
    };
    getKontekstEgenskaperMetadata(endringer).then((data) => {
      if (data != null) {
        setKontekstDataForEndringer(removeNil(data));
      }
    });
  }, [auth.token, endringer, utkast?.operasjoner.kretsDelingEndringer]);

  const getFormattedKontekstEgenskaper = (objects: object[]) => {
    if (objects.length === 0) {
      return ["Ingen tilhørighet"];
    }
    return objects.map((kontekstEgenskaper) => {
      if ("kretsNummer" in kontekstEgenskaper) {
        const kretsNavn = kontekstDataForEndringer?.find(
          (krets) => krets.kretsNummer === kontekstEgenskaper.kretsNummer,
        )?.kretsNavn;
        return `${kontekstEgenskaper.kretsNummer} ${kretsNavn}`;
      } else return "Ukjent krets";
    });
  };

  const EndringAndBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
  `;

  const KontekstWithBadge = ({ kontekstEgenskaper, isNew, isReplaced, isUnchanged }: KontekstWithBadgeProps) => {
    return (
      <EndringAndBadge>
        <Text>{kontekstEgenskaper}</Text>
        {isNew ? (
          <Badge colorScheme="green">ny</Badge>
        ) : isReplaced ? (
          <Badge colorScheme="gray">utgår</Badge>
        ) : isUnchanged ? (
          <Badge colorScheme="green">består</Badge>
        ) : null}
      </EndringAndBadge>
    );
  };

  return (
    <TilhorighetEndringer>
      {endringer.map((endring, i) => {
        if (!Array.isArray(endring.from) || !Array.isArray(endring.to)) {
          return null;
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
    </TilhorighetEndringer>
  );
};

type EndringFraTilProps = {
  endring: Endring;
  withBadges?: boolean;
};

const FraTilContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
`;

const EndringAndBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const RightArrow = styled(Icon)`
  color: var(--kvib-colors-blue-500);
  font-size: 20px;
  vertical-align: middle;
`;

export const EndringFraTil = ({ endring, withBadges }: EndringFraTilProps) => (
  <FraTilContainer>
    <EndringAndBadge>
      {endring.fra}
      {withBadges === true && (
        <Badge variant={"subtle"} colorScheme="gray">
          Utgår
        </Badge>
      )}
    </EndringAndBadge>
    <RightArrow icon="arrow_right_alt" />
    <EndringAndBadge>
      {endring.til}
      {withBadges === true && (
        <Badge variant={"subtle"} colorScheme="green">
          Ny
        </Badge>
      )}
    </EndringAndBadge>
  </FraTilContainer>
);

const EndringTitle = styled(Text)`
  font-size: var(--kvib-fontSizes-sm);
  color: var(--kvib-color-gray-700);
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--kvib-space-1);
`;

const TilhorighetEndringer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--kvib-space-2);
`;

const EndringCard = styled(Card)`
  display: flex;
  gap: var(--kvib-space-2);
  padding: var(--kvib-space-4);
`;
