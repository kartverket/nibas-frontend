import { StemmekretsResponse } from "types/api";

export type MultiselectValue = {
  value: string;
};

export type MergeFormData = {
  stemmekrets: StemmekretsResponse;
  stemmekretsnavn: string;
  stemmekretsnummer: string;
  stemmekretsNummerTilSammenslaaing: MultiselectValue[];
};
