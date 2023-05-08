import { useState } from "react";

const removeIdFromList = (id: string, list: string[]) => {
  const newOpenRows = list.slice();
  newOpenRows.splice(newOpenRows.indexOf(id));
  return newOpenRows;
};

export const useAccordionRows = () => {
  const [openRows, setOpenRows] = useState<string[]>([]);

  const closeRow = (id: string) => {
    setOpenRows(removeIdFromList(id, openRows));
  };

  const toggleRow = (id: string) => {
    if (openRows.includes(id)) {
      closeRow(id);
    } else {
      setOpenRows([...openRows, id]);
    }
  };

  const isRowOpen = (id: string) => openRows.includes(id);

  return {
    closeRow,
    toggleRow,
    isRowOpen,
  };
};
