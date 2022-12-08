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
          visible={value.visible ? true : false}
        >
          {value.visible ? (
            <Icon icon="visibility" aria-label={`Skjul ${title}`} />
          ) : (
            <Icon icon="visibility_off" aria-label={`Vis ${title}`} />
          )}
        </VisibilityButton>
        <TextContent>
          <div>{title}</div>
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
                visible={accordion.isVisible ? true : false}
                icon="expand_less"
                aria-label={`Lukk ${title}`}
              />
            ) : (
              <CaretIcon
                visible={accordion.isVisible ? true : false}
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
    outline: 3px solid ${({ theme }) => theme.colors.blueDark};
    outline-offset: 2px;
  }
`;

const TextContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;

  > :nth-child(2) {
    ${LinkButton} {
      &:hover {
        text-decoration: none;
      }

      &:focus-visible {
        outline: 3px solid ${({ theme }) => theme.colors.blueDark};
      }
    }
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
`;

const CaretIcon = styled(Icon)<{ visible: boolean }>`
  color: ${({ theme, visible }) =>
    visible ? theme.colors.white : theme.colors.blueDark};
  background: ${({ theme, visible }) =>
    visible ? theme.colors.blueDark : "transparent"};
  padding: 16px 12px;

  &:hover {
    background: ${({ theme }) => theme.colors.blueDark};
    color: ${({ theme }) => theme.colors.white};
  }
`;

const VisibilityButton = styled(Button).attrs(() => ({
  variant: "unstyled",
}))<{ visible: boolean }>`
  margin-right: 16px;
  color: ${({ theme, visible }) =>
    visible ? theme.colors.white : theme.colors.blueDark};
  background: ${({ theme, visible }) =>
    visible ? theme.colors.blueDark : "transparent"};
  padding: 8px;
  border-radius: 50%;
  height: 100%;

  &:hover {
    color: ${({ theme }) => theme.colors.blueDark};
    background: ${({ theme }) => theme.colors.blueLight};
  }
  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.colors.blueDark};
    outline-offset: 2px;
  }
`;

export default EditableGrenseAccordion;
