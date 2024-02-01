import useNibasApi from "../useNibasApi";
import { KommuneRef } from "types/api";
import { sortGrenserAlphabetically } from "utils/language/language";

const useKommuner = (fylkeId: string, shouldFetch = true) => {
    const { data: kommuner, ...rest } = useNibasApi(shouldFetch ? "/v1/kommuner" : null, {
        fylkeid: fylkeId,
    });

    const sortedKommuner = sortGrenserAlphabetically(kommuner) as KommuneRef[];

    return {
        kommuner: sortedKommuner,
        ...rest,
    };
};

export default useKommuner;
