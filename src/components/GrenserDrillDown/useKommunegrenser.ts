import { useState } from "react";

const useKommunegrenser = () => {
  const [selectedKommuner, setSelectedKommuner] = useState<
    Record<string, boolean>
  >({});

  const toggleKommunegrense = (kommunenavn: string) => {
    setSelectedKommuner({
      ...selectedKommuner,
      [kommunenavn]: !selectedKommuner[kommunenavn],
    });
  };

  return { selectedKommuner, toggleKommunegrense };
};

export default useKommunegrenser;
