import { useEffect, useState } from "react";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import useSWR from "swr";
import { fetcher } from "utils/swr";

export type KontekstType = "FYLKE" | "KOMMUNE";

type Kontekst = {
  type: KontekstType;
  id: number;
};

const kontekstEndepunktMapping: Record<KontekstType, string> = {
  FYLKE: "fylker",
  KOMMUNE: "kommuner",
};

export type ResponseItem = {
  id: number;
  lokalid: string;
  oppdateringsdato: string;
};

// const getMetadataFromItem = (
//   item: ResponseItem,
//   kontekstType: KontekstType
// ) => {
//   if (kontekstType === "FYLKE") {
//     return mapFylkeMetadata(item);
//   }

//   return null;
// };

const useMetadataFromFeature = (feature: Feature<Geometry> | null) => {
  const [kontekst, setKontekst] = useState<Kontekst | null>(null);
  // const [item, setItem] = useState<ResponseItem | null>(null);

  const { data: rawItem } = useSWR<ResponseItem>(() => {
    if (!kontekst) return;

    return `/v1/${kontekstEndepunktMapping[kontekst.type]}/${kontekst.id}`;
  }, fetcher);

  useEffect(() => {
    if (!feature) return;

    const { kontekstType, kontekstId } = feature.getProperties();

    setKontekst({
      type: kontekstType,
      id: kontekstId,
    });
  }, [feature]);

  // useEffect(() => {
  //   if (!kontekst || !rawItem) return;

  //   const mappedItem = getMetadataFromItem(rawItem, kontekst.type);

  //   setItem(mappedItem);
  // }, [kontekst, rawItem]);

  return {
    item: rawItem,
    kontekstType: kontekst?.type,
  };
};

export default useMetadataFromFeature;
