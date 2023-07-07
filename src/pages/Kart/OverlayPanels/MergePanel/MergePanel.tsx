import styled from "styled-components";
import { PanelHeader, PanelProps, SidePanel } from "../Panel";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { useUtkast, useUtkastEntity } from "contexts/UtkastContext";
import {
  StemmekretsResponse,
  StemmekretsSammenslaaingsendringRequest,
} from "types/api";
import { getIdFromEntity } from "utils/api";
import { FormProvider, useForm } from "react-hook-form";
import { MergeFormData } from "./MergeForm";
import { useErrorHandling } from "contexts/ErrorHandlingContext";
import { useCallback } from "react";
import Input from "components/Input";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { stemmekretsgrenserFetcher } from "api/stemmekrets";
import { deduplicate, removeNull } from "utils/list-utils";
import { MergeMultiselect } from "./MergeMultiselect";
import { useKommuneStemmekretser } from "hooks/inndelinger/useStemmekretser";
import { useFeatureStyle } from "contexts/FeatureStyleContext/FeatureStyleContext";
import {
  Button,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  Select,
} from "@kvib/react";
import { useHistory } from "contexts/HistoryContext";

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InputsWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

const Buttons = styled.div`
  display: flex;
  justify-content: end;
  gap: 16px;
  margin-top: auto;
`;

const MergePanel = ({ isOpen, className }: PanelProps) => {
  const { flatedata, closeOverlayPanel } = useOverlayPanel();
  const { setError } = useErrorHandling();
  const { utkast, updateUtkast } = useUtkast();
  const { tokenHolderFunc } = useAuthenticationFlow();
  const { setAndSaveSammenslaaingsFeatures } = useFeatureStyle();
  const { history } = useHistory();
  const { data: stemmekretserByKommune } = useKommuneStemmekretser(
    flatedata ? getIdFromEntity(flatedata) : ""
  );

  const utkastStemmekretser = useUtkastEntity(
    stemmekretserByKommune,
    "stemmekretsendringer"
  ) as StemmekretsResponse[] | undefined;

  const formMethods = useForm<MergeFormData>({
    defaultValues: {
      stemmekretsNummerTilSammenslaaing: [{ value: "default" }],
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

  const stemmekretsnummerValidator = {
    required: "Stemmekretsnummer er obligatorisk",
    pattern: {
      value: /^\d+$/,
      message: "Stemmekretsnummeret må være et gyldig positivt tall",
    },
    minValue: {
      value: 1,
      message: "Stemmekretsnummeret må være et gyldig positivt tall",
    },
    maxLength: {
      value: 4,
      message: "Stemmekretsnummeret kan ikke være lengre enn 4 tegn",
    },
  };

  const getStemmekretsByNummer = useCallback(
    (nummer: string): StemmekretsResponse | null => {
      return (
        utkastStemmekretser?.find(
          (krets) => krets.stemmekretsnummer === nummer
        ) ?? null
      );
    },
    [utkastStemmekretser]
  );

  const getOverlappingStemmekretsFeatureIds = (featureIds: string[]) => {
    return featureIds.filter(
      (featureId, index) => featureIds.indexOf(featureId) !== index
    );
  };

  const fromFormToRequest = (
    stemmekretsRespons: StemmekretsResponse,
    sammenslaaingsStemmekretser: StemmekretsResponse[]
  ): StemmekretsSammenslaaingsendringRequest => ({
    viderefoertStemmekrets: {
      lokalId: stemmekretsRespons.id.lokalid.value,
      version: stemmekretsRespons.version,
    },
    stemmekretserTilSammenslaaing: deduplicate(sammenslaaingsStemmekretser).map(
      (sammenslaaingsStemmekrets) => ({
        lokalId: sammenslaaingsStemmekrets.id.lokalid.value,
        version: sammenslaaingsStemmekrets.version,
      })
    ),
    stemmekretsNavn: getValues("stemmekretsnavn"),
    stemmekretsNummer: getValues("stemmekretsnummer"),
  });

  const mergeStemmekrets = async () => {
    // TODO: utkast skal være garantert med ny flyt, så må gjøre dette litt smartere
    if (!utkast) return;

    const selectedStemmekretsValue = getValues("stemmekrets");
    const stemmekretsNummerTilSammenslaaing: string[] = getValues(
      "stemmekretsNummerTilSammenslaaing"
    ).map((s) => s.value);

    const selectedStemmekrets = getStemmekretsByNummer(
      selectedStemmekretsValue
    );

    const stemmekretsTilSammenslaaingListe = removeNull(
      stemmekretsNummerTilSammenslaaing.map((s) => getStemmekretsByNummer(s))
    );

    if (stemmekretsTilSammenslaaingListe.length > 0 && selectedStemmekrets) {
      const updateUtkastRequest = {
        version: 1,
        navn: utkast.navn,
        endringstype: utkast.endringstype,
        operasjoner: {
          ...utkast.operasjoner,
          stemmekretsSammenslaaingsendring: fromFormToRequest(
            selectedStemmekrets,
            stemmekretsTilSammenslaaingListe
          ),
        },
      };
      updateUtkast(utkast.id, updateUtkastRequest);
      const sammenslaaingsStemmekretsIder = getStemmekretsIdList(
        selectedStemmekrets,
        stemmekretsTilSammenslaaingListe
      );

      const stemmekretsFeatureIds: string[] = await fetchStemmekretsgrenser(
        sammenslaaingsStemmekretsIder
      );
      const overlappingFeatureIds = getOverlappingStemmekretsFeatureIds(
        stemmekretsFeatureIds
      );

      setAndSaveSammenslaaingsFeatures(
        stemmekretsFeatureIds,
        overlappingFeatureIds
      );
    }
    closeOverlayPanel();
    reset();
  };

  const fetchStemmekretsgrenser = async (stemmekretsIder: string[]) => {
    const stemmekretsgrenserResponse = await stemmekretsgrenserFetcher(
      stemmekretsIder,
      tokenHolderFunc()?.token
    );
    return stemmekretsgrenserResponse
      ? stemmekretsgrenserResponse
          .filter((value) => value != null)
          .map((value) => String(value))
      : [];
  };

  const getStemmekretsIdList = (
    selectedStemmekrets: StemmekretsResponse,
    stemmekretserTilSammenslaaing: StemmekretsResponse[]
  ) => {
    const stemmekretsIderTilSammenslaaing = stemmekretserTilSammenslaaing.map(
      (stemmekretsRef) => stemmekretsRef.id.lokalid.value
    );
    if (selectedStemmekrets) {
      stemmekretsIderTilSammenslaaing.push(
        selectedStemmekrets.id.lokalid.value
      );
    }

    return stemmekretsIderTilSammenslaaing;
  };

  const openCreateUtkastModal = () => {
    // TODO: denne skal nok håndteres på en annen måte med ny utkastflyt
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
    setValue("stemmekretsnavn", selectedStemmekrets?.stemmekretsnavn ?? "");
    setValue("stemmekretsnummer", selectedStemmekrets?.stemmekretsnummer ?? "");
  };

  return (
    <SidePanel isOpen={isOpen} className={className}>
      <PanelHeader onClose={closeOverlayPanel}>
        Slå sammen stemmekretser
      </PanelHeader>
      {utkastStemmekretser && (
        <FormProvider {...formMethods}>
          <Form onSubmit={handleSubmit(openCreateUtkastModal)}>
            <Heading as="h3" size="sm">
              Hvilken stemmekrets skal brukes som utgangspunkt?
            </Heading>
            <FormControl>
              <FormLabel>Stemmekrets</FormLabel>
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
                  .sort(
                    (a, b) =>
                      parseInt(a.stemmekretsnummer) -
                      parseInt(b.stemmekretsnummer)
                  )
                  .map((stemmekrets) => (
                    <option
                      key={stemmekrets.id.lokalid.value}
                      value={stemmekrets.stemmekretsnummer}
                    >
                      {`${stemmekrets.stemmekretsnummer} - ${stemmekrets.stemmekretsnavn}`}
                    </option>
                  ))}
              </Select>
            </FormControl>
            <Divider />
            <Heading as="h3" size="sm">
              Hvilke stemmekretser ønsker du å slå sammen med denne kretsen?
            </Heading>
            <MergeMultiselect alleStemmekretser={utkastStemmekretser} />
            <Divider />
            <Heading as="h3" size="sm">
              Hva skal den sammenslåtte stemmekretsen hete?
            </Heading>
            <InputsWrapper>
              <Input
                label="Stemmekretsnummer"
                {...register("stemmekretsnummer", stemmekretsnummerValidator)}
                validationError={{
                  showError: !!errors?.stemmekretsnummer,
                  message: errors.stemmekretsnummer?.message ?? "",
                }}
              />
              <Input
                label="Stemmekretsnavn"
                {...register("stemmekretsnavn", stemmekretsnavnValidator)}
                validationError={{
                  showError: !!errors.stemmekretsnavn,
                  message: errors.stemmekretsnavn?.message ?? "",
                }}
              />
            </InputsWrapper>
            <Buttons>
              <Button
                variant="ghost"
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
      )}
    </SidePanel>
  );
};

export default MergePanel;
