import { useState } from "react";

export const useTableSort = <T>(properties: (keyof T)[]) => {
  const [sortProperty, setSortProperty] = useState(properties[0]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const onSort = (property: keyof T) => {
    if (property === sortProperty) {
      if (sortOrder === "asc") {
        setSortOrder("desc");
      } else if (sortOrder === "desc") {
        // Hvis man har trykket på en knapp tre ganger går vi tilbake til start
        setSortProperty(properties[0]);
        setSortOrder("asc");
      }
    } else {
      setSortProperty(property);
      setSortOrder("asc");
    }
  };

  const sortHeaderProps = (property: keyof T) => ({
    onClick: () => onSort(property),
    isActivated: sortProperty === property,
    isReversed: sortProperty === property && sortOrder === "desc",
  });

  return { sortProperty, sortOrder, sortHeaderProps };
};
