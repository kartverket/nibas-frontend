import UtkastItem from "./UtkastItem";
import { UnstyledList } from "components/UnstyledList";
import useNibasApi from "hooks/useNibasApi";
import styled from "styled-components";
import { Fragment } from "react";
import { UtkastRef } from "../../../types/api";
import { Divider } from "@kvib/react";

const List = styled(UnstyledList)`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const sortUtkastByCreatedDesc = (a: UtkastRef, b: UtkastRef): number =>
  b.opprettetDato.localeCompare(a.opprettetDato);

const UtkastList = () => {
  const { data: utkasts } = useNibasApi("/v1/utkast");

  if (!utkasts) return null;

  return (
    <List>
      {utkasts.sort(sortUtkastByCreatedDesc).map((utkast) => (
        <Fragment key={utkast.id}>
          <UtkastItem utkast={utkast} />
          <Divider />
        </Fragment>
      ))}
    </List>
  );
};

export default UtkastList;
