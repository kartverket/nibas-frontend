import UtkastItem from "./UtkastItem";
import { UnstyledList } from "components/UnstyledList";
import useNibasApi from "hooks/useNibasApi";
import styled from "styled-components";

const List = styled(UnstyledList)`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Divider = styled.hr`
  width: 100%;
  margin: 0;
  border: 1px solid var(--gray_light);
`;

const UtkastList = () => {
  const { data: utkasts } = useNibasApi("/v1/utkast");

  if (!utkasts) return null;

  return (
    <List>
      {utkasts.map((utkast) => (
        <>
          <UtkastItem key={utkast.id} utkast={utkast} />
          <Divider />
        </>
      ))}
    </List>
  );
};

export default UtkastList;
