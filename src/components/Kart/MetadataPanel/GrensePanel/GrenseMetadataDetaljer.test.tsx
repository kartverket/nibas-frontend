import { render } from "test/test-utils";
import GrenseMetadataDetaljer from "./GrenseMetadataDetaljer";
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

describe("GrenseMetadataDetaljer", () => {
  it("should render when feature type is Kommunegrense", () => {
    const kommunegrenseFeature =
      getClonedFeatureWithGrenseType("Kommunegrense");
    render(<GrenseMetadataDetaljer feature={kommunegrenseFeature} />);
  });

  it("should render when feature type is Fylkesgrense", () => {
    const fylkesgrenseFeature = getClonedFeatureWithGrenseType("Fylkesgrense");
    render(<GrenseMetadataDetaljer feature={fylkesgrenseFeature} />);
  });
});
