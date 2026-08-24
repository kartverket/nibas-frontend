import { Text } from "@kvib/react";
import { styled } from "styled-components";
import { FeatureProperties, Metadata } from "../../../types/api";
import { SelectFeature } from "../interactions/useSelect";
import { isTeigFeature } from "utils/features";

type Props = {
  activeFeaturesAmount: number;
  selectedFeatures: SelectFeature[];
  selectedFeatureId: string;
};

const Container = styled.div`
  background-color: white;
  border-radius: 16px;
  box-shadow: var(--kvib-shadows-md);

  :last-child {
    border-radius: 0 0 16px 16px;
  }
`;

const PaddedText = styled(Text)`
  padding: 8px;
`;

const FeatureItem = styled.div<{ $clicked: boolean }>`
  background-color: ${({ $clicked }) => ($clicked ? "var(--kvib-colors-gray-100)" : "none")};
  overflow: hidden;
`;

export const SelectedFeatureList = ({ activeFeaturesAmount, selectedFeatures, selectedFeatureId }: Props) => {
  const activeFeaturesSorted = selectedFeatures.toSorted((a, b) => Number(b.clicked) - Number(a.clicked));
  const activeAndSelectedFeaturesDiff = activeFeaturesAmount - selectedFeatures.length;
  return (
    <Container>
      <PaddedText fontStyle={"italic"} fontSize={"xs"}>
        Trykk igjen for å velge en annen grense
      </PaddedText>
      {activeFeaturesSorted.map((sf) => {
        const properties = sf.feature.getProperties() as FeatureProperties;
        const grenseType = isTeigFeature(sf.feature) ? "Teiggrense" : properties.type;
        return (
          <FeatureItem key={sf.feature.getId()} $clicked={sf.feature.getId() === selectedFeatureId}>
            <PaddedText>{`${properties.shouldArchive ? "(Arkivert)" : ""} ${grenseType}`}</PaddedText>
          </FeatureItem>
        );
      })}
      {activeAndSelectedFeaturesDiff !== 0 && (
        <PaddedText fontStyle={"italic"}>+ {activeAndSelectedFeaturesDiff} andre grenser</PaddedText>
      )}
    </Container>
  );
};
