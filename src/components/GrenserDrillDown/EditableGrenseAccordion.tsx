import Icon from "components/Icon";
import { useEditGrense } from "contexts/EditGrenserContext/useEditGrense";
import styled from "styled-components";
import useVisibility from "hooks/useVisibility";
import { EditingType } from "contexts/EditGrenserContext";
import { Feature } from "ol";
import { Outline } from "style/mixins";
import { Geometry } from "ol/geom";
import { Button, IconButton, Spinner } from "@kvib/react";

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
  const { value, toggleEditing, toggleVisible } = useEditGrense(
    grenseType,
    grenseId,
    features
  );

  return (
    <ListItem>
      <Header>
        <VisibilityButton
          onClick={toggleVisible}
          $visible={value.visible ? true : false}
          aria-label={value.visible ? `Skjul ${title}` : `Vis ${title}`}
          icon={<Icon icon={value.visible ? "visibility" : "visibility_off"} />}
        />
        <TextContent>
          <span>{title}</span>
          <div>
            <Button
              variant="link"
              onClick={toggleEditing}
              isDisabled
              title="Midlertidig utilgjengelig"
            >
              {value.editing ? "Stopp redigering" : "Rediger grenser"}
            </Button>
          </div>
        </TextContent>
        {isFetching && (
          <Spinner color="blue" size="lg" aria-label={`Henter ${title}`} />
        )}
        <IconButton
          variant="ghost"
          onClick={accordion.toggle}
          aria-label={accordion.isVisible ? `Lukk ${title}` : `Åpne ${title}`}
          icon={
            <CaretIcon
              icon={accordion.isVisible ? "expand_less" : "expand_more"}
              $visible={accordion.isVisible ? true : false}
            />
          }
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

const CaretIcon = styled(Icon)<{ $visible: boolean }>`
  color: ${({ $visible }) => ($visible ? "var(--white)" : "var(--blue_dark)")};
  background: ${({ $visible }) =>
    $visible ? "var(--blue_dark)" : "transparent"};
  padding: 16px 12px;

  &:hover {
    background: var(--blue_dark);
    color: var(--white);
  }
`;

const VisibilityButton = styled(IconButton)<{ $visible: boolean }>`
  margin-right: 16px;
  color: ${({ $visible }) => ($visible ? "var(--white)" : "var(--blue_dark)")};
  background: ${({ $visible }) =>
    $visible ? "var(--blue_dark)" : "transparent"};
  padding: 8px;
  border-radius: 50%;
  height: 100%;

  &:hover {
    color: var(--blue_dark);
    background: var(--blue_light);
  }
  &:focus-visible {
    ${Outline}
  }
`;

export default EditableGrenseAccordion;
