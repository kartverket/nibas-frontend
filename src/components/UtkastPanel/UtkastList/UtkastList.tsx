import UtkastItem from "./UtkastItem";
import { UnstyledList } from "components/UnstyledList";
import { UtkastRef } from "types/api";

const UtkastList = () => {
  // const { data: utkasts } = useNibasApi("/v1/utkast");
  const utkasts: UtkastRef[] = [
    {
      id: "2b43e304-2515-4ceb-bdf7-f44c4fa726e6",
      navn: "Malvik more hair",
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
