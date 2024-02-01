import { useState } from "react";

export const useTableSort = (properties: string[]) => {
    const [sortProperty, setSortProperty] = useState<(typeof properties)[number]>(properties[0]);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    const onSort = (property: string) => {
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

    const sortHeaderProps = (property: string) => ({
        onClick: () => onSort(property),
        isActivated: sortProperty === property,
        isReversed: sortProperty === property && sortOrder === "desc",
    });

    return { sortProperty, sortOrder, sortHeaderProps };
};
