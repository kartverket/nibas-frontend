import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import { styled } from "styled-components";
import { EditingType } from "contexts/EditGrenserContext";
import { useEditGrense } from "contexts/EditGrenserContext/useEditGrense";
import { GrenseRef } from "types/api";
import { getIdFromEntity } from "utils/api";
import { Outline } from "style/mixins";
import { IconButton } from "@kvib/react";

type Props<T extends GrenseRef> = {
  grense: T;
  title: string;
  type: EditingType;
  features: Feature<Geometry>[] | null;
};

const ToggleableGrense = <T extends GrenseRef>({
  grense,
  title,
  type,
  features,
}: Props<T>) => {
  const { value, toggleVisible } = useEditGrense(
    type,
    getIdFromEntity(grense),
    features,
  );

  return (
    <Wrapper $isVisible={value.visible ? true : false}>
      <IconButton
        onClick={toggleVisible}
        aria-label={value.visible ? "Synlig" : "Usynlig"}
        icon={value.visible ? "visibility" : "visibility_off"}
      />
      <Title>{title}</Title>
    </Wrapper>
  );
};
const Title = styled.div`
  flex: 1;
  margin-left: 8px;
  user-select: none;
`;

const Wrapper = styled.div<{ $isVisible: boolean }>`
  display: flex;
  align-items: center;
  margin: 16px 0 0 24px;

  > :first-child {
    color: ${({ $isVisible }) =>
      $isVisible
        ? "var(--kvib-colors-chakra-inverse-text)"
        : "var(--kvib-colors-blue-500)"};
    padding: 8px;
    border-radius: 50%;
    background: ${({ $isVisible }) =>
      $isVisible ? "var(--kvib-colors-blue-500)" : "transparent"};

    &:hover {
      background: var(--kvib-colors-blue-50);
      color: var(--kvib-colors-blue-500);
    }

    &:focus-visible {
      ${Outline}
    }
  }
`;

export default ToggleableGrense;
