import { useMemo } from "react";
import { GrenseDictionary } from "contexts/EditGrenserContext";
import { GrenseRef } from "types/api";

const useOnlyDisplayEditingGrenser = (
  grenser: GrenseRef[] | undefined,
  values: GrenseDictionary,
  onlyDisplayEditing = false
) => {
  const filteredGrenser = useMemo(() => {
    if (!grenser) return null;

    const dirtyIds = Object.keys(values) ?? [];
    return onlyDisplayEditing
      ? grenser.filter((fylke) =>
          dirtyIds.some((fylkeId) => fylke.id === fylkeId)
        )
      : grenser;
  }, [values, grenser, onlyDisplayEditing]);

  return filteredGrenser;
};

export default useOnlyDisplayEditingGrenser;
