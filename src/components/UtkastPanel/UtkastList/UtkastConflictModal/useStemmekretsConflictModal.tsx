import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { resolveUtkastConflict } from "api/utkast";
import useNibasApi from "hooks/useNibasApi";
import { useEffect, useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import {
  ConflictResolved,
  FramtidigVersjonConflict,
  StemmekretsRequest,
  StemmekretsResponse,
  UtkastResponse,
} from "types/api";
import { getIdFromEntity } from "utils/api";

type StemmekretsFormData = {
  stemmekretsnummer: string;
  stemmekretsnavn: string;
  tellekretsnummer: string;
  tellekretsnavn: string;
  valgdistriktsnummer: string;
  endringstype: string;
  gyldigFra: string;
  confirmed: boolean;
};

type Inputs = {
  stemmekretser: StemmekretsFormData[];
};

const getStemmekretsRequest = (
  grunnkretsFormData: StemmekretsFormData,
  futureVersions: StemmekretsResponse[],
  stemmekrets: StemmekretsRequest
) => {
  const futureVersion = futureVersions?.find(
    (fv) => fv.gyldighet.gyldigFra === grunnkretsFormData.gyldigFra
  );

  return {
    identifikasjon: {
      lokalid: stemmekrets.identifikasjon.lokalid,
    },
    stemmekretsnummer: grunnkretsFormData.stemmekretsnummer,
    stemmekretsnavn: grunnkretsFormData.stemmekretsnavn,
    tellekretsnavn: grunnkretsFormData.tellekretsnavn,
    tellekretsnummer: grunnkretsFormData.tellekretsnummer,
    valgdistriktsnummer: grunnkretsFormData.valgdistriktsnummer,
    endringstype: grunnkretsFormData.endringstype,
    gyldigFra: grunnkretsFormData.gyldigFra,
    version: futureVersion?.version,
  } as StemmekretsRequest;
};

type Props = {
  conflictResponse: FramtidigVersjonConflict;
  stemmekrets: StemmekretsRequest;
  utkast: UtkastResponse;
  onNext: () => void;
};

const useStemmekretsConflictModal = ({
  conflictResponse,
  stemmekrets,
  utkast,
  onNext,
}: Props) => {
  const { data: futureVersions } = useNibasApi(
    "/v1/stemmekretser/{lokalid}/framtidigeversjoner",
    {
      lokalid: stemmekrets.identifikasjon.lokalid,
    }
  );

  const conflictedFutureVersions = useMemo(
    () =>
      futureVersions?.filter((fv) =>
        conflictResponse.affectedIds.some(
          (affectedId) =>
            affectedId.lokalid.value === getIdFromEntity(fv) &&
            affectedId.gyldighetsdato === fv.id.gyldighetsdato
        )
      ),
    [futureVersions, conflictResponse.affectedIds]
  );

  const { tokenHolderFunc } = useAuthenticationFlow();

  const { control, register, setValue, handleSubmit, watch } = useForm<Inputs>({
    defaultValues: {
      stemmekretser: [],
    },
  });
  const { fields } = useFieldArray({
    control,
    name: "stemmekretser",
  });

  const submit = handleSubmit(async (data) => {
    if (!conflictedFutureVersions) return;

    const resolvedConflict: ConflictResolved = {
      lokalid: {
        value: getIdFromEntity(stemmekrets),
      },
      stemmekretsRequests: data.stemmekretser
        .map((s) => ({
          endringstype: s.endringstype,
          gyldigFra: s.gyldigFra,
          stemmekretsRequest: getStemmekretsRequest(
            s,
            conflictedFutureVersions as StemmekretsResponse[],
            stemmekrets
          ),
        }))
        .concat({
          endringstype: utkast.endringstype,
          gyldigFra: utkast.gyldigFra,
          stemmekretsRequest: stemmekrets,
        }),
      grunnkretsRequests: [],
    };

    await resolveUtkastConflict(
      utkast.id,
      resolvedConflict,
      tokenHolderFunc()?.token
    );

    onNext();
  });

  useEffect(() => {
    if (!conflictedFutureVersions) return;

    setValue(
      "stemmekretser",
      conflictedFutureVersions.map((futureVersion) => ({
        stemmekretsnavn: futureVersion.stemmekretsnavn ?? "",
        stemmekretsnummer: futureVersion.stemmekretsnummer ?? "",
        valgdistriktsnummer: futureVersion.valgdistriktsnummer ?? "",
        tellekretsnavn: futureVersion.tellekretsnavn ?? "",
        tellekretsnummer: futureVersion.tellekretsnummer ?? "",
        endringstype: futureVersion.endringstype ?? "",
        gyldigFra: futureVersion.gyldighet.gyldigFra,
        confirmed: false,
      }))
    );
  }, [conflictedFutureVersions, setValue]);

  const getIsConfirmed = (index: number) =>
    watch(`stemmekretser.${index}.confirmed`);

  const getIsAllConfirmed = () =>
    watch("stemmekretser").every((g) => g.confirmed);

  return {
    fields,
    register,
    submit: getIsAllConfirmed() ? submit : undefined,
    getIsConfirmed,
    getIsAllConfirmed,
  };
};

export default useStemmekretsConflictModal;
