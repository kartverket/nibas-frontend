import { useEditGrense } from "contexts/EditGrenserContext/useEditGrense";
import { styled } from "styled-components";
import useVisibility from "hooks/useVisibility";
import { EditingType } from "contexts/EditGrenserContext";
import { Feature } from "ol";
import { Outline } from "style/mixins";
import { Geometry } from "ol/geom";
import { IconButton, Spinner } from "@kvib/react";

type Props = {
  grenseType: EditingType;
  grenseId: string;
  features: Feature<Geometry>[] | null;
  isFetching: boolean;
  title: string;
  children?: React.ReactNode;
};

const EditableGrenseAccordion = ({
  grenseId,
  grenseType,
  children,
  features,
  isFetching,
  title,
}: Props) => {
  const accordion = useVisibility();
  const { value, toggleVisible } = useEditGrense(
    grenseType,
    grenseId,
    features,
  );

  return (
    <ListItem>
      <Header>
        <VisibilityButton
          onClick={toggleVisible}
          $isVisible={value.visible ? true : false}
          aria-label={value.visible ? `Skjul ${title}` : `Vis ${title}`}
          icon={value.visible ? "visibility" : "visibility_off"}
        />
        <TextContent>
          <span>{title}</span>
        </TextContent>
        {isFetching && (
          <Spinner
            size="lg"
            color="var(--kvib-colors-blue-500)"
            aria-label={`Henter ${title}`}
          />
        )}
        <Caret
          $isVisible={accordion.isVisible}
          variant="ghost"
          onClick={accordion.toggle}
          aria-label={accordion.isVisible ? `Lukk ${title}` : `Åpne ${title}`}
          icon={accordion.isVisible ? "expand_less" : "expand_more"}
        />
      </Header>
      {accordion.isVisible && children}
    </ListItem>
  );
};

const ListItem = styled.li`
  margin: 16px 0 0 8px;
`;

const TextContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;

  > :first-child {
    user-select: none;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
`;

const VisibilityButton = styled(IconButton)<{ $isVisible: boolean }>`
  width: fit-content;
  height: 100%;
  margin-right: 16px;
  color: ${({ $isVisible }) =>
    $isVisible
      ? "var(--kvib-colors-chakra-inverse-text)"
      : "var(--kvib-colors-blue-500)"};
  background: ${({ $isVisible }) =>
    $isVisible ? "var(--kvib-colors-blue-500)" : "transparent"};
  padding: 8px;
  border-radius: 50%;

  &:hover {
    color: var(--kvib-colors-blue-500);
    background: var(--kvib-colors-blue-50);
  }
  &:focus-visible {
    ${Outline}
  }
`;

const Caret = styled(IconButton)<{ $isVisible: boolean }>`
  width: fit-content;
  height: 100%;
  color: ${({ $isVisible }) =>
    $isVisible
      ? "var(--kvib-colors-chakra-inverse-text)"
      : "var(--kvib-colors-blue-500)"};
  background: ${({ $isVisible }) =>
    $isVisible ? "var(--kvib-colors-blue-500)" : "transparent"};
  padding: 16px 12px;
  border-radius: 0;

  &:hover {
    background: var(--kvib-colors-blue-500);
    color: var(--kvib-colors-chakra-inverse-text);
  }
`;

export default EditableGrenseAccordion;
