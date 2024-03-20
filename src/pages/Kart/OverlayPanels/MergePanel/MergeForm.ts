type MultiselectValue = {
  value: string;
};

export type MergeFormData = {
  stemmekrets: string;
  navn: string;
  nummer: string;
  nummerTilSammenslaaing: MultiselectValue[];
};
