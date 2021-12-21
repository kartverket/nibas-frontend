export type Grense = {
  id: number;
};

type Spraak = {
  navn: string;
  spraak: string;
};

export type AdministrativEnhet = Grense & {
  type: "FYLKE" | "KOMMUNE";
  navn: Spraak[];
};
