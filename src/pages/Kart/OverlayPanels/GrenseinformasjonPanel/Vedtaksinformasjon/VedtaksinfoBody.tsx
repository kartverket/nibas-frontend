import { Datepicker, Grid, Input } from "@kvib/react";
import { FormViewState, Referanse, VedtakinfoForm } from "./Vedtaksinformasjon";
import { VedtakinfoField } from "./VedtakinfoField";
import { DokumentasjonsreferanseDTO } from "types/api";
import { styled } from "styled-components";
import {
  Control,
  Controller,
  FieldErrors,
  UseFormClearErrors,
  UseFormRegister,
  UseFormSetError,
} from "react-hook-form";
import { Referanser } from "./Referanser";

type ReferanseBodyProps = {
  formViewState: FormViewState;
  deleteInternref: (index: number) => void;
  deleteDokref: (index: number) => void;
  control: Control<VedtakinfoForm>;
  errors: FieldErrors<VedtakinfoForm>;
  vedtak?: DokumentasjonsreferanseDTO;
  register: UseFormRegister<VedtakinfoForm>;
  dokref?: Referanse[];
  setDokref: React.Dispatch<React.SetStateAction<Referanse[] | undefined>>;
  internref?: Referanse[];
  setInternref: React.Dispatch<React.SetStateAction<Referanse[] | undefined>>;
  setError: UseFormSetError<VedtakinfoForm>;
  clearErrors: UseFormClearErrors<VedtakinfoForm>;
};

export const VedtaksinfoBody = ({
  formViewState,
  vedtak,
  register,
  internref,
  dokref,
  setDokref,
  setInternref,
  deleteInternref,
  deleteDokref,
  errors,
  setError,
  clearErrors,
  control,
}: ReferanseBodyProps) => {
  const addDokumentlenke = (lenke: Referanse) => {
    setDokref((prevState) => {
      if (prevState != null) {
        return [...prevState, lenke];
      } else {
        return [lenke];
      }
    });
  };

  const addInternreferanse = (lenke: Referanse) => {
    setInternref((prevState) => {
      if (prevState != null) {
        return [...prevState, lenke];
      } else {
        return [lenke];
      }
    });
  };

  return (
    <VedtakinfoContainer templateColumns="4fr 3fr">
      <Vedtaksfelter>
        <FieldContainer>
          <VedtakinfoField
            error={errors.rettskildeTittel}
            formViewState={formViewState}
            tooltipLabel="Navn på lov, forskrift, vedtak, dom eller traktat."
            title="Vedtakstittel"
            value={vedtak?.rettskildeTittel}
            isRequired
          >
            <Input
              {...register("rettskildeTittel", {
                required: "Feltet er påkrevd",
                maxLength: {
                  value: 250,
                  message: "Feltet kan ikke inneholde mer enn 250 tegn.",
                },
              })}
              isRequired={false}
              backgroundColor="white"
              placeholder="Skriv inn tittelen på vedtaket"
            />
          </VedtakinfoField>
        </FieldContainer>
        <FieldContainer>
          <Row>
            <Controller
              rules={{ required: "Feltet er påkrevd" }}
              control={control}
              name="fastsettingsdato"
              render={({ field }) => {
                return (
                  <VedtakinfoField
                    error={errors.fastsettingsdato}
                    formViewState={formViewState}
                    tooltipLabel="Dato for når dokumentet ble skrevet, publisert eller revidert."
                    title="Fastsettingsdato"
                    isRequired
                    value={
                      vedtak?.fastsettingsdato != null
                        ? new Date(vedtak?.fastsettingsdato).toLocaleDateString("nb-NO")
                        : undefined
                    }
                  >
                    <Datepicker
                      {...register("fastsettingsdato", {
                        required: "Feltet er påkrevd",
                      })}
                      defaultSelected={field.value}
                      onChange={(e): void => {
                        field.onChange(new Date(e.target.value));
                      }}
                    />
                  </VedtakinfoField>
                );
              }}
            />
            <VedtakinfoField
              error={errors.rettskildeId}
              formViewState={formViewState}
              tooltipLabel="Referanse til lov, forskrift, vedtak, dom eller traktat i form av kode som angir type dokument, dato og nummer For eksempel: LOV-2012-09-07-65."
              title="Rettskilde-ID"
              value={vedtak?.rettskildeId ?? "Ingen ID satt."}
            >
              <Input {...register("rettskildeId")} backgroundColor="white" placeholder="Ikke spesifisert" />
            </VedtakinfoField>
          </Row>
        </FieldContainer>
        <FieldContainer>
          <Row>
            <Controller
              control={control}
              rules={{ required: "Feltet er påkrevd" }}
              name="vedtakGyldigFra"
              render={({ field }) => {
                return (
                  <VedtakinfoField
                    error={errors.vedtakGyldigFra}
                    formViewState={formViewState}
                    tooltipLabel="Tidspunktet når objektet oppstod i den virkelige verden"
                    title="Gyldig fra"
                    isRequired
                    value={
                      vedtak?.vedtakGyldigFra != null
                        ? new Date(vedtak?.vedtakGyldigFra).toLocaleDateString("nb-NO")
                        : "Ingen gyldig fra satt."
                    }
                  >
                    <Datepicker
                      {...register("vedtakGyldigFra", {
                        required: "Feltet er påkrevd",
                      })}
                      id="vedtakGyldigFra"
                      defaultSelected={field.value}
                      onChange={(e): void => {
                        field.onChange(new Date(e.target.value));
                      }}
                    />
                  </VedtakinfoField>
                );
              }}
            />
            <Controller
              control={control}
              name="vedtakGyldigTil"
              render={({ field }) => {
                return (
                  <VedtakinfoField
                    error={errors.vedtakGyldigTil}
                    formViewState={formViewState}
                    tooltipLabel="Tidspunktet når objektet opphørte å eksistere i den virkelige verden"
                    title="Gyldig til"
                    value={
                      vedtak?.vedtakGyldigTil != null
                        ? new Date(vedtak?.vedtakGyldigTil).toLocaleDateString("nb-NO")
                        : "Ingen gyldig til satt."
                    }
                  >
                    <Datepicker
                      {...register("vedtakGyldigTil", {
                        validate: (gyldigTilDate, formValues) => {
                          if (gyldigTilDate) {
                            if (new Date() > gyldigTilDate) {
                              return "Gyldig til dato må være satt til etter dagens dato.";
                            }

                            if (formValues.vedtakGyldigFra) {
                              return (
                                gyldigTilDate > formValues.vedtakGyldigFra ||
                                "Gyldig til dato må være satt til etter gyldig fra dato."
                              );
                            }
                          }

                          return true;
                        },
                      })}
                      id="vedtakGyldigTil"
                      fromDate={new Date()}
                      defaultSelected={field.value}
                      onChange={(e): void => {
                        field.onChange(new Date(e.target.value));
                      }}
                    />
                  </VedtakinfoField>
                );
              }}
            />
          </Row>
        </FieldContainer>
        <FieldContainer>
          <VedtakinfoField
            maxWidth="500px"
            error={errors.hjemmel}
            formViewState={formViewState}
            tooltipLabel="Lov som rettskilden er begrunnet i."
            title="Hjemmel"
            value={vedtak?.hjemmel ?? "Ingen hjemmel satt."}
          >
            <Input {...register("hjemmel")} backgroundColor="white" placeholder="Ikke spesifisert" />
          </VedtakinfoField>
        </FieldContainer>
        <FieldContainer>
          <VedtakinfoField
            maxWidth="500px"
            error={errors.fastsettingsmyndighet}
            formViewState={formViewState}
            tooltipLabel="Offentlig instans som har fastsatt en grense."
            title="Fastsettingsmyndighet"
            value={vedtak?.fastsettingsmyndighet ?? "Ingen myndighet satt"}
          >
            <Input {...register("fastsettingsmyndighet")} backgroundColor="white" placeholder="Ikke spesifisert" />
          </VedtakinfoField>
        </FieldContainer>
      </Vedtaksfelter>
      <Referanser
        control={control}
        deleteInternref={deleteInternref}
        deleteDokref={deleteDokref}
        formViewState={formViewState}
        errors={errors}
        setError={setError}
        clearErrors={clearErrors}
        dokref={dokref}
        internref={internref}
        addDokumentlenke={addDokumentlenke}
        addInternreferanse={addInternreferanse}
      />
    </VedtakinfoContainer>
  );
};

export const ReferanseCardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
`;

const VedtakinfoContainer = styled(Grid)`
  padding: 12px 0;
  gap: 24px;
`;

const FieldContainer = styled.div`
  padding: 5px 0;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 20px;
`;

const Vedtaksfelter = styled.div`
  /* margin: 20px 15px 15px 0px; */
`;
