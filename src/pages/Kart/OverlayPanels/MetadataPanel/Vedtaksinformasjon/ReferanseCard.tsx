import { Card, Icon, Link, Text } from "@kvib/react";
import { Referanse } from "./OversiktReferanser";

export const ReferanseCard = ({
  referanse,
  displayMode,
  urlMode,
}: {
  referanse: Referanse;
  displayMode: boolean;
  urlMode: boolean;
}) => {
  // TODO: Hvorfor er referanse.beskrivelse undefined når man legger til noe?
  return (
    <Card>
      <Text>{referanse?.beskrivelse}</Text>
      {urlMode && (
        <Link href={referanse?.beskrivelse}>
          <Icon icon="open_in_new" />
        </Link>
      )}
    </Card>
  );
};
