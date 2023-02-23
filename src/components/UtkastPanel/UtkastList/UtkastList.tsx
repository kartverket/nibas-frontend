import UtkastItem from "./UtkastItem";
import { UnstyledList } from "components/UnstyledList";
import useNibasApi from "hooks/useNibasApi";
import styled from "styled-components";

const List = styled(UnstyledList)`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const UtkastList = () => {
  const { data: utkasts } = useNibasApi("/v1/utkast");

  if (!utkasts) return null;

  return (
    <List>
      {utkasts.map((utkast) => (
        <UtkastItem key={utkast.id} utkast={utkast} />
      ))}
    </List>
  );
};

export default UtkastList;
