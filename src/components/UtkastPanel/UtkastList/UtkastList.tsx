import UtkastItem from "./UtkastItem";
import { UnstyledList } from "components/UnstyledList";
import useNibasApi from "hooks/useNibasApi";
import styled from "styled-components";
import { Fragment, useState } from "react";
import { Divider } from "components/Divider";
import Toast from "components/Kart/Toolbar/Toast";
import { useTranslation } from "react-i18next";
import { UtkastRef } from "../../../types/api";

const List = styled(UnstyledList)`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const sortUtkastByCreatedDesc = (a: UtkastRef, b: UtkastRef): number =>
  b.opprettetDato.localeCompare(a.opprettetDato);

const UtkastList = () => {
  const { data: utkasts } = useNibasApi("/v1/utkast");
  const [utkastJustPublished, setUtkastJustPublished] = useState(false);

  if (!utkasts) return null;

  return (
    <>
      <List>
        {utkasts.sort(sortUtkastByCreatedDesc).map((utkast) => (
          <Fragment key={utkast.id}>
            <UtkastItem
              utkast={utkast}
              setUtkastJustPublished={setUtkastJustPublished}
            />
            <Divider />
          </Fragment>
        ))}
      </List>
      {utkastJustPublished && (
        <Toast title="Utkast publisert!" status={"success"} />
      )}
    </>
  );
};

export default UtkastList;
