import { GrenseType } from "hooks/layers/types";

const administrativeGrenser: GrenseType[] = [
    "Kommunegrense",
    "Fylkesgrense",
    "Riksgrense",
    "AvtaltAvgrensningslinje",
    "Territorialgrense",
];

export const isAdministrativGrense = (grenseType: GrenseType): boolean => {
    return administrativeGrenser.includes(grenseType);
};
