import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import { styled } from "styled-components";
import Icon from "components/Icon";
import { EditingType } from "contexts/EditGrenserContext";
import { useEditGrense } from "contexts/EditGrenserContext/useEditGrense";
import { GrenseRef } from "types/api";
import { getIdFromEntity } from "utils/api";
import { Outline } from "style/mixins";
import { Button, IconButton } from "@kvib/react";

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
    features
  );

  const openInfo = () => {
    // todo
  };

  return (
    <Wrapper visible={value.visible ? true : false}>
      <IconButton
        onClick={toggleVisible}
        aria-label={value.visible ? "Synlig" : "Usynlig"}
        icon={<Icon icon={value.visible ? "visibility" : "visibility_off"} />}
      />
      <Title>{title}</Title>
      <Button
        variant="link"
        onClick={openInfo}
        isDisabled
        title="Kommer snart!"
      >
        {value.editing ? "Avslutt redigering" : "Rediger"}
      </Button>
    </Wrapper>
  );
};
const Title = styled.div`
  flex: 1;
  margin-left: 8px;
  user-select: none;
`;

const Wrapper = styled.div<{ visible: boolean }>`
  display: flex;
  align-items: center;
  margin: 16px 0 0 24px;

  > :first-child {
    color: ${({ visible }) => (visible ? "var(--white)" : "var(--blue_dark)")};
    padding: 8px;
    border-radius: 50%;
    background: ${({ visible }) =>
      visible ? "var(--blue_dark)" : "transparent"};

    &:hover {
      background: var(--blue_light);
      color: var(--blue_dark);
    }

    &:focus-visible {
      ${Outline}
    }
  }
`;

export default ToggleableGrense;
