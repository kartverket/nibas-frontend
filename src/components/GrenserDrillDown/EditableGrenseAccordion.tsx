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
  // console.log(fylkesgrenser);

  const accordion = useVisibility();

  return (
    <ListItem>
      <Header>
        <VisibilityButton onClick={toggleVisible}>
          {value.visible ? (
            <Icon icon="visibility" />
          ) : (
            <Icon icon="visibility_off" />
          )}
        </VisibilityButton>
        <TextContent>
          <Button variant="unstyled" onClick={accordion.toggle}>
            {title}
          </Button>
          <div>
            <LinkButton onClick={toggleEditing}>
              {value.editing ? "Stopp redigering" : `Rediger grenser`}
            </LinkButton>
          </div>
        </TextContent>
        {isFetching && <Loader />}
        <Button
          variant="unstyled"
          onClick={accordion.toggle}
          icon={
            accordion.isVisible ? (
              <Icon icon="expand_less" aria-label="Lukk" />
            ) : (
              <Icon icon="expand_more" aria-label="Åpne" />
            )
          }
        />
      </Header>

      {accordion.isVisible && children}
    </ListItem>
  );
};

const ListItem = styled.li`
  margin: 16px 0;
`;

const TextContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
`;

const VisibilityButton = styled(Button).attrs(() => ({
  variant: "unstyled",
}))`
  margin-right: 16px;
`;

export default EditableGrenseAccordion;
