export type MultiselectValue = {
  value: string;
};

export type SammenslaaingFormData = {
  stemmekretsnavn: string;
  stemmekretsnummer: string;
  stemmekretsNummerTilSammenslaaing: MultiselectValue[];
};
