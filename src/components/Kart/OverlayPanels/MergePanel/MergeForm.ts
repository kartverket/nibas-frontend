export type MultiselectValue = {
  value: string;
};

export type MergeFormData = {
  stemmekrets: string;
  stemmekretsnavn: string;
  stemmekretsnummer: string;
  stemmekretsNummerTilSammenslaaing: MultiselectValue[];
};
