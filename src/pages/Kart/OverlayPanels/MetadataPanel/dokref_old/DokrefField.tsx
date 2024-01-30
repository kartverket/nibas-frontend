import { VedtakinfoRow } from "../Vedtaksinformasjon/VedtakinfoRow";
import { Feature } from "ol";

type Props = {
  children: React.ReactNode;
  name: string;
  tooltipLabel: string;
  feature: Feature;
  fieldKey: keyof DokrefForm;
};

export type DokrefForm = {
  apiId?: string;
  dokumentlenker: string[];
  fastsettingsdato: string;
  fastsettingsmyndighet?: string;
  hjemmel?: string;
  internReferanserKartverket: string[];
  rettskildeId?: string;
  rettskildeTittel: string;
};

export const DokrefField = ({ children, name, tooltipLabel }: Props) => {
  return (
    <VedtakinfoRow tooltipLabel={tooltipLabel} name={name}>
      {children}
    </VedtakinfoRow>
  );
};
