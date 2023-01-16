import Button, { LinkButton } from "components/form/Button";
import Icon from "components/Icon";
import Loader from "components/Loader";
import { useEditGrense } from "contexts/EditGrenserContext/useEditGrense";
import { FC } from "react";
import styled from "styled-components";
import useVisibility from "hooks/useVisibility";
import { EditingType } from "contexts/EditGrenserContext";
import LineString from "ol/geom/LineString";
import { Feature } from "ol";
import { Outline } from "style/mixins";

type Props = {
  grenseType: EditingType;
  grenseId: string;
  features: Feature<LineString>[] | null;
  isFetching: boolean;
  title: string;
};

const EditableGrenseAccordion: FC<Props> = ({
  grenseId,
  grenseType,
  children,
  features,
  isFetching,
  title,
}) => {
  const { value, toggleEditing, toggleVisible } = useEditGrense(
    grenseType,
    grenseId,
    features
  );

  const accordion = useVisibility();

  return (
    <ListItem>
      <Header>
        <VisibilityButton
          onClick={toggleVisible}
          $visible={value.visible ? true : false}
        >
          {value.visible ? (
            <Icon icon="visibility" aria-label={`Skjul ${title}`} />
          ) : (
            <Icon icon="visibility_off" aria-label={`Vis ${title}`} />
          )}
        </VisibilityButton>
        <TextContent>
          <span>{title}</span>
          <div>
            <LinkButton onClick={toggleEditing}>
              {value.editing ? "Stopp redigering" : `Rediger grenser`}
            </LinkButton>
          </div>
        </TextContent>
        {isFetching && <Loader aria-label={`Henter ${title}`} />}
        <CaretButton
          variant="unstyled"
          onClick={accordion.toggle}
          icon={
            accordion.isVisible ? (
              <CaretIcon
                $visible={accordion.isVisible ? true : false}
                icon="expand_less"
                aria-label={`Lukk ${title}`}
              />
            ) : (
              <CaretIcon
                $visible={accordion.isVisible ? true : false}
                icon="expand_more"
                aria-label={`Åpne ${title}`}
              />
            )
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

const CaretButton = styled(Button)`
  &:focus-visible {
    ${Outline}
  }
`;

const TextContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;

  > :first-child {
    user-select: none;
  }

  > :nth-child(2) {
    ${LinkButton} {
      &:hover {
        text-decoration: none;
      }

      &:focus-visible {
        outline: 3px solid var(--blue_dark);
      }
    }
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

const VisibilityButton = styled(Button).attrs(() => ({
  variant: "unstyled",
}))<{ $visible: boolean }>`
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
