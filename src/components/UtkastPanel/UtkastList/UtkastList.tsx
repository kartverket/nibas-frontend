import UtkastItem from "./UtkastItem";
import { UnstyledList } from "components/UnstyledList";
import { UtkastRef } from "types/api";

const UtkastList = () => {
  // const { data: utkasts } = useNibasApi("/v1/utkast");
  const utkasts: UtkastRef[] = [
    {
      id: "896e4241-7e84-4728-87e0-4f039ef671ba",
      navn: "Malvik got hands",
    },
    {
      id: "456",
      navn: "Utkast 2",
    },
  ];

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
