import UtkastItem from "./UtkastItem";
import { UnstyledList } from "components/UnstyledList";
import useNibasApi from "hooks/useNibasApi";

const UtkastList = () => {
  const { data: utkasts } = useNibasApi("/v1/utkast");

  if (!utkasts) return null;

  return (
    <UnstyledList>
      {utkasts.map((utkast) => (
        <UtkastItem key={utkast.id} utkast={utkast} />
      ))}
    </UnstyledList>
  );
};

export default UtkastList;
