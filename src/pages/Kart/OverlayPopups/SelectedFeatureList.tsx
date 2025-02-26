import { Text } from "@kvib/react";
import { styled } from "styled-components";
import { FeatureProperties } from "../../../types/api";
import { SelectFeature } from "../interactions/useSelect";

type Props = {
  allFeatures: SelectFeature[];
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

export const SelectedFeatureList = ({ allFeatures, selectedFeatureId }: Props) => {
  const activeFeaturesSorted = allFeatures.toSorted((a, b) => Number(b.clicked) - Number(a.clicked));
  return (
    <Container>
      <PaddedText fontStyle={"italic"} fontSize={"xs"}>
        Trykk igjen for å velge en annen grense
      </PaddedText>
      {activeFeaturesSorted.map((sf) => {
        const grenseType = (sf.feature.getProperties() as FeatureProperties).type;
        return (
          <FeatureItem key={sf.feature.getId()} $clicked={sf.feature.getId() === selectedFeatureId}>
            <PaddedText>{grenseType}</PaddedText>
          </FeatureItem>
        );
      })}
    </Container>
  );
};
