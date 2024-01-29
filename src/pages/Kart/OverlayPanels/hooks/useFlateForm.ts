import { useForm } from "react-hook-form";
import {
  FeatureProperties,
} from "types/api";

type FlateForm = {
  navn: string;
  nummer: string;
};

export const useFlateForm = (grenseFeatureProperties: FeatureProperties) => {
  const {
    register,
    getValues,
    reset,
    formState: { isDirty },
  } = useForm<FlateForm>();

  const type =
    grenseFeatureProperties?.kontekstEgenskaper?.map((k) => k.type)[0] ?? null;

  const flateRegisters = {
    navn: { ...register("navn") },
    nummer: {
      ...register("nummer"),
    },
  };

  const updateDraftFromFeature = () => {
    console.log(getValues());
  };

  return {
    type,
    flateRegisters,
    reset,
    isDirty,
    updateDraftFromFeature,
  };
};
