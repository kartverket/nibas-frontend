import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { resolveUtkastConflict } from "api/utkast";
import useNibasApi from "hooks/useNibasApi";
import { useEffect, useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import {
  ConflictResolved,
  FramtidigVersjonConflict,
  GrunnkretsRequest,
  GrunnkretsResponse,
  UtkastResponse,
} from "types/api";

type GrunnkretsFormData = {
  grunnkretsnummer: string;
  navn: string;
  endringstype: string;
  gyldigFra: string;
  confirmed: boolean;
};

type Inputs = {
  grunnkretser: GrunnkretsFormData[];
};

const getGrunnkretsRequest = (
  grunnkretsFormData: GrunnkretsFormData,
  futureVersions: GrunnkretsResponse[],
  grunnkrets: GrunnkretsRequest
) => {
  const futureVersion = futureVersions?.find(
    (fv) => fv.gyldighet.gyldigFra === grunnkretsFormData.gyldigFra
  );

  return {
    identifikasjon: {
      lokalid: grunnkrets.identifikasjon.lokalid,
    },
    grunnkretsnummer: grunnkretsFormData.grunnkretsnummer,
    version: futureVersion?.version,
    navn: grunnkretsFormData.navn,
    endringstype: grunnkretsFormData.endringstype,
    gyldigFra: grunnkretsFormData.gyldigFra,
  } as GrunnkretsRequest;
};

type Props = {
  conflictResponse: FramtidigVersjonConflict;
  grunnkrets: GrunnkretsRequest;
  utkast: UtkastResponse;
  onNext: () => void;
};

const useGrunnkretsConflictModal = ({
  conflictResponse,
  grunnkrets,
  utkast,
  onNext,
}: Props) => {
  const { data: futureVersions } = useNibasApi(
    "/v1/grunnkretser/{lokalid}/framtidigeversjoner",
    {
      lokalid: grunnkrets.identifikasjon.lokalid,
    }
  );

  const conflictedFutureVersions = useMemo(
    () =>
      futureVersions?.filter((fv) =>
        conflictResponse.affectedIds.some(
          (affectedId) => affectedId.gyldigFra === fv.gyldighet.gyldigFra
        )
      ),
    [futureVersions, conflictResponse.affectedIds]
  );

  const { tokenHolderFunc } = useAuthenticationFlow();

  const { control, register, setValue, handleSubmit, watch } = useForm<Inputs>({
    defaultValues: {
      grunnkretser: [],
    },
  });
  const { fields } = useFieldArray({
    control,
    name: "grunnkretser",
  });

  const submit = handleSubmit(async (data) => {
    if (!conflictedFutureVersions) return;

    const resolvedConflict: ConflictResolved = {
      lokalid: {
        value: grunnkrets.identifikasjon.lokalid,
      },
      grunnkretsRequests: data.grunnkretser
        .map((g) => ({
          endringstype: g.endringstype,
          gyldigFra: g.gyldigFra,
          grunnkretsRequest: getGrunnkretsRequest(
            g,
            conflictedFutureVersions as GrunnkretsResponse[],
            grunnkrets
          ),
        }))
        .concat({
          endringstype: utkast.endringstype,
          gyldigFra: utkast.gyldigFra,
          grunnkretsRequest: grunnkrets,
        }),
      stemmekretsRequests: [],
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
      "grunnkretser",
      conflictedFutureVersions.map((futureVersion) => ({
        grunnkretsnummer: futureVersion.grunnkretsnummer,
        navn: futureVersion.navn,
        endringstype: futureVersion.endringstype ?? "---",
        gyldigFra: futureVersion.gyldighet.gyldigFra,
        confirmed: false,
      }))
    );
  }, [conflictedFutureVersions, setValue, utkast.gyldigFra]);

  const getIsConfirmed = (index: number) =>
    watch(`grunnkretser.${index}.confirmed`);

  const getIsAllConfirmed = () =>
    watch("grunnkretser").every((g) => g.confirmed);

  return {
    fields,
    register,
    submit,
    getIsConfirmed,
    getIsAllConfirmed,
  };
};

export default useGrunnkretsConflictModal;
