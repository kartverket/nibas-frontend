import Button, { LinkButton } from "components/form/Button";
import Icon from "components/Icon";
import Loader from "components/Loader";
import { useEditGrense } from "contexts/EditGrenserContext/useEditGrense";
import useFylkesgrenser from "hooks/inndelinger/useFylkesgrenser";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import FylkeList from "./FylkeList";
import useVisibility from "hooks/useVisibility";

const Fylkesgrenser = () => {
  const { t } = useTranslation();
  const [shouldFetch, setShouldFetch] = useState(false);
  const { fylkesgrenser, isFetching } = useFylkesgrenser(shouldFetch);
  const { value, toggleEditing, toggleVisible } = useEditGrense(
    "fylke",
    "fylke",
    fylkesgrenser
  );
  console.log(fylkesgrenser);

  const accordion = useVisibility();

  useEffect(() => {
    if (value.editing || value.visible) {
      setShouldFetch(true);
    }
  }, [value]);

  const editFylkesgrenser = () => {
    toggleEditing();
  };

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
            {t("inndelinger.Fylkesgrenser")}
          </Button>
          <div>
            <LinkButton onClick={editFylkesgrenser}>
              {value.editing ? "Stopp redigering" : "Rediger fylkesgrenser"}
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

      {accordion.isVisible && <FylkeList />}
    </ListItem>
  );
};

const ListItem = styled.li``;

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

export default Fylkesgrenser;
