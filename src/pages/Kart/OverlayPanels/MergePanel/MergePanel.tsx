import { styled } from "styled-components";
import { PanelHeader, SidePanel } from "../Panel";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { useUtkast, useUtkastEntity } from "contexts/UtkastContext/UtkastContext";
import { StemmekretsResponse, StemmekretsSammenslaaingsendringRequest } from "types/api";
import { FormProvider, useForm } from "react-hook-form";
import { MergeFormData } from "./MergeForm";
import { useErrorHandling } from "contexts/ErrorHandlingContext";
import { useCallback } from "react";
import Input from "components/Input";
import { stemmekretsgrenserFetcher } from "api/stemmekrets";
import { getDuplicateItems, getUniqueItemsBy, removeNil } from "utils/list-utils";
import { MergeMultiselect } from "./MergeMultiselect";
import { useKommuneStemmekretser } from "hooks/inndelinger/useStemmekretser";
import { useFeatureStyle } from "contexts/FeatureStyleContext/FeatureStyleContext";
import { Alert, AlertIcon, AlertTitle, Button, Divider, FormControl, FormLabel, Heading, Select } from "@kvib/react";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { useAuthentication } from "components/Authentication/AuthenticationHook";
import { useInndelinger } from "contexts/InndelingerContext/InndelingerContext";
import { getInndelingFremtidigEndringDato } from "utils/features";
import { getNumberValidatorFunctionForInndelingType } from "utils/inndelinger-utils";
import { useValgtGyldighetsdato } from "contexts/GyldighetsdatoContext";

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InputsWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 16px;
`;

const Buttons = styled.div`
  display: flex;
  justify-content: end;
  gap: 16px;
  margin-top: auto;
`;

const MergePanel = () => {
  const { closeOverlayPanel } = useOverlayPanel();
  const { setError } = useErrorHandling();
  const { utkast, updateUtkast, utkastHarEndringer } = useUtkast();
  const auth = useAuthentication();
  const { setAndSaveSammenslaaingStyles, setAndSaveSammenslaaingOverlappingStyles } = useFeatureStyle();
  const { history } = useHistory();
  const { currentlyEditingInndelinger } = useInndelinger();
  const { gyldighetsdato } = useValgtGyldighetsdato();

  const currentlyEditingStemmekrets = currentlyEditingInndelinger.find(
    (inndeling) => inndeling.inndelingtype === "stemmekrets",
  );

  const { data: stemmekretserByKommune } = useKommuneStemmekretser(
    currentlyEditingStemmekrets != null ? currentlyEditingStemmekrets.id : null,
    gyldighetsdato,
  );

  const utkastStemmekretser = useUtkastEntity(stemmekretserByKommune, "stemmekretsendringer") as
    | StemmekretsResponse[]
    | undefined;

  const formMethods = useForm<MergeFormData>({
    defaultValues: {
      nummerTilSammenslaaing: [{ value: "default" }],
    },
  });
  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = formMethods;

  const stemmekretsnavnValidator = {
    required: "Stemmekretsnavn er obligatorisk",
  };

  const getStemmekretsByNummer = useCallback(
    (nummer: string): StemmekretsResponse | null => {
      return utkastStemmekretser?.find((krets) => krets.nummer === nummer) ?? null;
    },
    [utkastStemmekretser],
  );

  const fromFormToRequest = (
    stemmekretsRespons: StemmekretsResponse,
    sammenslaaingsStemmekretser: StemmekretsResponse[],
  ): StemmekretsSammenslaaingsendringRequest => ({
    viderefoertStemmekrets: {
      lokalId: stemmekretsRespons.id.lokalid.value,
      version: stemmekretsRespons.version,
    },
    stemmekretserTilSammenslaaing: getUniqueItemsBy(sammenslaaingsStemmekretser, (krets) => krets.id.lokalid.value).map(
      (sammenslaaingsStemmekrets) => ({
        lokalId: sammenslaaingsStemmekrets.id.lokalid.value,
        version: sammenslaaingsStemmekrets.version,
      }),
    ),
    navn: getValues("navn"),
    nummer: getValues("nummer"),
  });

  const mergeStemmekrets = async () => {
    // Man kommer seg ikke hit uten utkast uansett, men for typesikringens del:
    if (!utkast) {
      return;
    }

    const selectedStemmekretsValue = getValues("stemmekrets");
    const stemmekretsNummerTilSammenslaaing: string[] = getValues("nummerTilSammenslaaing").map((s) => s.value);

    const selectedStemmekrets = getStemmekretsByNummer(selectedStemmekretsValue);

    const stemmekretsTilSammenslaaingListe = removeNil(
      stemmekretsNummerTilSammenslaaing.map((s) => getStemmekretsByNummer(s)),
    );

    if (stemmekretsTilSammenslaaingListe.length > 0 && selectedStemmekrets) {
      const updateUtkastRequest = {
        version: utkast.version,
        navn: utkast.navn,
        endringstype: utkast.endringstype,
        operasjoner: {
          ...utkast.operasjoner,
          stemmekretsSammenslaaingsendring: fromFormToRequest(selectedStemmekrets, stemmekretsTilSammenslaaingListe),
        },
      };
      updateUtkast(utkast.id, updateUtkastRequest);
      const sammenslaaingsStemmekretsIds = getStemmekretsIdList(selectedStemmekrets, stemmekretsTilSammenslaaingListe);
      const stemmekretsFeatureIds = await stemmekretsgrenserFetcher(
        sammenslaaingsStemmekretsIds,
        gyldighetsdato,
        auth.token,
      );
      const overlappingFeatureIds = getDuplicateItems(stemmekretsFeatureIds);
      const uniqueStemmekretsFeatureIds = stemmekretsFeatureIds.filter(
        (sfi) => !overlappingFeatureIds.some((ofi) => sfi === ofi),
      );

      setAndSaveSammenslaaingStyles(uniqueStemmekretsFeatureIds);
      setAndSaveSammenslaaingOverlappingStyles(overlappingFeatureIds);
    }
    closeOverlayPanel();
    reset();
  };

  const getStemmekretsIdList = (
    selectedStemmekrets: StemmekretsResponse,
    stemmekretserTilSammenslaaing: StemmekretsResponse[],
  ) =>
    stemmekretserTilSammenslaaing
      .map((stemmekretsResponse) => stemmekretsResponse.id.lokalid.value)
      .concat(selectedStemmekrets.id.lokalid.value);

  const handleMerge = () => {
    if (history.entries.length > 0 && history.index > 0) {
      setError({
        title: "Kan ikke slå sammen stemmekretser",
        description:
          "Du kan ikke gjøre en sammenslåing i et eksisterende utkast som har andre endringer. Avslutt redigeringen av dette utkastet før du gjennomfører sammenslåingen.",
      });
      return;
    }
    mergeStemmekrets();
  };

  // Oppdaterer stemmekretsnavn og stemmekretsnummer når valgt stemmekrets endres
  const selectStemmekretsRegister = register("stemmekrets");
  const updateDefaultValues = (value: string) => {
    const selectedStemmekrets = getStemmekretsByNummer(value);
    setValue("navn", selectedStemmekrets?.navn ?? "");
    setValue("nummer", selectedStemmekrets?.nummer ?? "");
  };

  const existingStemmekretsnummere = utkastStemmekretser
    ? utkastStemmekretser
        .filter(
          (stemmekrets) =>
            ![getValues("stemmekrets"), ...getValues("nummerTilSammenslaaing").map((n) => n.value)].includes(
              stemmekrets.nummer,
            ),
        )
        .map((inndeling) => inndeling.nummer)
    : [];

  return (
    <SidePanel>
      <PanelHeader onClose={closeOverlayPanel}>Slå sammen stemmekretser</PanelHeader>
      {(history.entries.length > 0 && history.index > 0) || utkastHarEndringer() ? (
        <Alert>
          <AlertIcon />
          <AlertTitle>
            Du kan ikke gjøre en sammenslåing i et eksisterende utkast som har andre endringer. Avslutt redigeringen av
            dette utkastet før du gjennomfører sammenslåingen.
          </AlertTitle>
        </Alert>
      ) : (
        utkastStemmekretser && (
          <FormProvider {...formMethods}>
            <Form onSubmit={handleSubmit(handleMerge)}>
              <FormControl>
                <FormLabel>Stemmekrets (utgangspunkt)</FormLabel>
                <Select
                  {...selectStemmekretsRegister}
                  onChange={(e) => {
                    selectStemmekretsRegister.onChange(e);
                    updateDefaultValues(e.currentTarget.value);
                  }}
                  defaultValue="default"
                >
                  <option value="default" disabled>
                    Velg en stemmekrets fra listen
                  </option>
                  {utkastStemmekretser
                    .sort((a, b) => parseInt(a.nummer) - parseInt(b.nummer))
                    .map((stemmekrets) => {
                      const fremtidigEndringDato = getInndelingFremtidigEndringDato(stemmekrets.id.lokalid.value);

                      return fremtidigEndringDato != null ? (
                        <option key={stemmekrets.id.lokalid.value} value={stemmekrets.nummer} disabled>
                          {`${stemmekrets.nummer} - ${stemmekrets.navn} (fremtidig endring, kan ikke sammenslås)`}
                        </option>
                      ) : (
                        <option key={stemmekrets.id.lokalid.value} value={stemmekrets.nummer}>
                          {`${stemmekrets.nummer} - ${stemmekrets.navn}`}
                        </option>
                      );
                    })}
                </Select>
              </FormControl>
              <MergeMultiselect alleStemmekretser={utkastStemmekretser} />
              <Divider />
              <Heading as="h3" size="sm">
                Informasjon om den nye flaten
              </Heading>
              <InputsWrapper>
                <Input
                  label="Stemmekretsnr."
                  {...register(
                    "nummer",
                    getNumberValidatorFunctionForInndelingType("stemmekrets")({
                      shouldNotBeEqualWith: existingStemmekretsnummere,
                    }),
                  )}
                  validationError={{
                    showError: !!errors?.nummer,
                    message: errors.nummer?.message ?? "",
                  }}
                />
                <Input
                  label="Stemmekretsnavn"
                  {...register("navn", stemmekretsnavnValidator)}
                  validationError={{
                    showError: !!errors.navn,
                    message: errors.navn?.message ?? "",
                  }}
                />
              </InputsWrapper>
              <Buttons>
                <Button
                  variant="tertiary"
                  onClick={() => {
                    closeOverlayPanel();
                    reset();
                  }}
                >
                  Avbryt
                </Button>
                <Button type="submit" isDisabled={!isDirty}>
                  Slå sammen
                </Button>
              </Buttons>
            </Form>
          </FormProvider>
        )
      )}
    </SidePanel>
  );
};

export default MergePanel;
