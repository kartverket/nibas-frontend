import { Feature } from "ol";
import { VedtakinfoRow } from "./VedtakinfoRow";
import { useDokumentreferanser } from "./useDokumentreferanser";
import { Input, Text } from "@kvib/react";
import { VedtakinfoForm } from "./OversiktReferanser";
import { UseFormRegister, UseFormRegisterReturn } from "react-hook-form";

export const VedtakinfoField = ({
  displayMode,
  feature,
  name,
  placeholder,
  tooltipLabel,
  title,
  value,
  register,
}: {
  displayMode: boolean;
  feature: Feature;
  name: keyof VedtakinfoForm;
  placeholder: string;
  tooltipLabel: string;
  title: string;
  value?: string;
  register: UseFormRegister<VedtakinfoForm>;
}) => {
  return (
    <VedtakinfoRow tooltipLabel={tooltipLabel} name={title}>
      {displayMode ? (
        <Text>{value}</Text>
      ) : (
        <Input
          {...register(name)}
          backgroundColor={"white"}
          placeholder={placeholder}
        />
      )}
    </VedtakinfoRow>
  );
};
