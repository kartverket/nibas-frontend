import { Card, Stack, Text } from "@kvib/react";
import { HistoryTypeValues } from "contexts/HistoryContext/types";
import { MinimalHistoryEntry } from "./UlagredeEndringer";
import { styled } from "styled-components";

type EndringProps = {
  type: HistoryTypeValues;
  endringer: MinimalHistoryEntry[];
};

export const Endring = ({ type, endringer }: EndringProps) => {
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

const EndringTitle = styled(Text)`
  font-size: small;
  color: var(--kvib-color-gray-700);
`;

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
        description: (
          <Text>
            {antallEndringer <= 1 ? `${antallEndringer} grunnkrets` : `${antallEndringer} grunnkretser`} har fått endret
            informasjon
          </Text>
        ),
      };
    case "stemmekrets":
      return {
        title: <EndringTitle>Endring på stemmekretser</EndringTitle>,
        description: (
          <Text>
            {antallEndringer <= 1 ? `${antallEndringer} stemmekrets` : `${antallEndringer} stemmekretser`} har fått
            endret informasjon
          </Text>
        ),
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
        description: (
          <Text>
            {antallEndringer <= 1 ? `${antallEndringer} grense` : `${antallEndringer} grenser`} har fått endret
            tilhørighet
          </Text>
        ),
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
