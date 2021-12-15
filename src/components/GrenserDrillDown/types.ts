export type Grense = {
  id: number;
};

// export type SimpleFylke = Grense & {
//   type: "FYLKE";
//   nummer: string;
//   navn: string;
// };

// export type SimpleKommune = Grense & {
//   type: "KOMMUNE";
//   nummer: string;
//   navn: string;
// };

type Spraak = {
  navn: string;
  spraak: string;
};

export type AdministrativEnhet = Grense & {
  type: "FYLKE" | "KOMMUNE";
  navn: Spraak[];
};
