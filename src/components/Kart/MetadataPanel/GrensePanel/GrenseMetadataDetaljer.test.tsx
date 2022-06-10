import { render } from "test/test-utils";
import { ReactNode } from "react";
import GrenseMetadataDetaljer from "./GrenseMetadataDetaljer";
import { EditGrenserProvider } from "contexts/EditGrenserContext";
import { mockBasicFeature } from "mocks/handlers/responses";
import { FeatureProperties } from "types/api";

const getClonedFeatureWithGrenseType = (grenseType: string) => {
  const featureCopy = mockBasicFeature.clone();
  const properties = featureCopy.getProperties() as FeatureProperties;
  featureCopy.setProperties({
    ...properties,
    type: grenseType,
  } as FeatureProperties);

  return featureCopy;
};

const renderWithProvider = (ui: ReactNode) =>
  render(<EditGrenserProvider>{ui}</EditGrenserProvider>);

describe("GrenseMetadataDetaljer", () => {
  it("should render when feature type is Kommunegrense", () => {
    const kommunegrenseFeature =
      getClonedFeatureWithGrenseType("Kommunegrense");
    renderWithProvider(
      <GrenseMetadataDetaljer feature={kommunegrenseFeature} />
    );
  });

  it("should render when feature type is Fylkesgrense", () => {
    const fylkesgrenseFeature = getClonedFeatureWithGrenseType("Fylkesgrense");
    renderWithProvider(
      <GrenseMetadataDetaljer feature={fylkesgrenseFeature} />
    );
  });
});
