import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import { Alert, AlertIcon, Button, Datepicker, Input, Select, Textarea } from "@kvib/react";
import { GrenseType } from "hooks/layers/types";
import { styled } from "styled-components";
import { dateToFriendlyDatestring, getDateInFriendlyString } from "./utils";
import useNibasApi from "hooks/useNibasApi";
import { FeatureProperties, KodelisteRespons, Metadata } from "types/api";
import { isTempFeatureId } from "pages/Kart/interactions/tempFeatureIdUtil";
import { EditingType, useEditAllGrenser } from "contexts/EditGrenserContext";
import GrenseinformasjonRow from "./GrenseinformasjonRow";
import useIsGrenseinformasjonPanelDisabled from "../hooks/useIsGrenseInformasjonPanelDisabled";
import { useGrenseinformasjonForm } from "../hooks/useGrenseinformasjonForm";
import { PanelHeader } from "../Panel";
import { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import { useHistory } from "contexts/HistoryContext";

type Props = {
  feature: Feature<Geometry>;
  onClose: () => void;
};

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

type EditGrenseInfoButtonProps = {
  isEditing: boolean;
  handleSubmit: () => void;
  toggleEdit: () => void;
};

const EditGrenseInfoButton = ({ isEditing, handleSubmit, toggleEdit }: EditGrenseInfoButtonProps) => {
  return isEditing ? (
    <Button
      onClick={() => {
        handleSubmit();
        toggleEdit();
      }}
      rightIcon="check_circle"
    >
      Fullfør redigering
    </Button>
  ) : (
    <Button onClick={() => toggleEdit()}>Rediger</Button>
  );
};

const GrenseinformasjonForm = ({ feature, onClose }: Props) => {
  const { data: kodeliste } = useNibasApi("/v1/kodeliste/maalemetode-koder");
  const { getCurrentlyEditingType } = useEditAllGrenser();
  const { history } = useHistory();
  const [isEditing, setIsEditing] = useState(false);
  const isGrenseinformasjonPanelDisabled = useIsGrenseinformasjonPanelDisabled(feature);

  const { register, handleSubmit, getValues, control, reset, getDefaultValues, onSubmit } =
    useGrenseinformasjonForm(feature);

  const properties = feature.getProperties() as FeatureProperties;
  const metadata = properties.metadata as Metadata;
  const gyldigTil = properties.metadata ? metadata.common?.gyldigTil : undefined;
  const isCommonFieldDisabled = isGrenseinformasjonPanelDisabled || metadata?.common?.gyldigTil != null;

  const getMaalemetodeText = (maalemetoder: KodelisteRespons, id: string) => {
    if (!id) return "Ikke spesifisert";

    const maalemetode = maalemetoder.items.find((item) => item.id === id);
    if (maalemetode) {
      return maalemetode?.kode + " " + maalemetode?.label;
    }
    return "Ukjent målemetode er registrert på grensen";
  };

  const getPossibleGrenseTypesFromEditingType = (editingType: EditingType | null): GrenseType[] => {
    if (editingType === "stemmekrets") {
      return ["Stemmekretsgrense", "Kommunegrense"];
    }
    if (editingType === "grunnkrets") {
      return ["Grunnkretsgrense", "Delområdegrense", "Kommunegrense"];
    }

    return [];
  };

  const getSistOppdatert = () => {
    if (metadata) {
      const oppdateringsDato = metadata.common?.sporingsinformasjon.oppdateringsdato;

      if (oppdateringsDato) {
        return getDateInFriendlyString(oppdateringsDato);
      }
    }

    return "Ukjent";
  };

  useEffect(() => {
    setIsEditing(false);
    reset(getDefaultValues(feature));
  }, [feature, getDefaultValues, reset, history]);

  return (
    <FormContainer>
      <PanelHeader
        onClose={onClose}
        subHeading={`${isTempFeatureId(feature.getId()) ? "" : `Sist oppdatert: ${getSistOppdatert()}`}`}
        noMargin
        button={
          !isCommonFieldDisabled
            ? EditGrenseInfoButton({
                isEditing: isEditing,
                handleSubmit: handleSubmit(onSubmit),
                toggleEdit: () => {
                  if (isEditing) {
                    reset(getDefaultValues(feature));
                  }
                  setIsEditing(!isEditing);
                },
              })
            : null
        }
      >
        Informasjon
      </PanelHeader>

      <GrenseinformasjonRow
        name="Identifikator (UUID)"
        tooltipLabel="Grensen sin unike identifikator"
        isRequired
        valueLabel={(() => {
          const featureId = feature.getId()?.toString();

          if (featureId && isTempFeatureId(featureId)) return `Ny grense - ID blir satt ved publisering`;

          return feature.getId()?.toString() || null;
        })()}
      />

      <GrenseinformasjonRow
        name="Gyldig fra"
        tooltipLabel="Dato når grensen skal være gyldig fra. Fra-dato settes automatisk til publiseringsdato for utkastet ditt."
        isRequired
        valueLabel={(() => {
          const date = metadata.common?.gyldigFra;
          const formattedDate = getDateInFriendlyString(date);
          const featureId = feature.getId()?.toString();

          if (featureId && isTempFeatureId(featureId)) return "Ny grense - Dato blir satt ved publisering";

          return formattedDate || null;
        })()}
      />

      <GrenseinformasjonRow
        name="Grensetype"
        tooltipLabel="Hvilken type grense som er valgt."
        valueLabel={getValues("grenseType")}
        isEditing={isEditing}
        isRequired
      >
        <Select {...register("grenseType")}>
          {getPossibleGrenseTypesFromEditingType(getCurrentlyEditingType()).map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </Select>
      </GrenseinformasjonRow>

      {gyldigTil && (
        <div>
          <GrenseinformasjonRow
            name="Gyldig til"
            tooltipLabel="Dato når grensen skal være gyldig til."
            valueLabel={getDateInFriendlyString(gyldigTil)}
          />
          <Alert status="warning" variant="top-accent">
            <AlertIcon />
            Grensen er satt til å utgå ved en fremtidig dato, og du vil derfor ikke kunne gjøre noen endringer på denne
            grensen.
          </Alert>
        </div>
      )}

      <GrenseinformasjonRow
        name="Datafangstdato"
        tooltipLabel="Dato når grensen siste gang ble registert, observert eller målt."
        valueLabel={(() => {
          const date = getValues("datafangstDato");

          if (!date) return undefined;

          const formattedDate = dateToFriendlyDatestring(date);

          const featureId = feature.getId()?.toString();

          if (featureId && isTempFeatureId(featureId)) return "Ny grense - Dato blir satt ved publisering";

          return formattedDate || undefined;
        })()}
        isEditing={isEditing}
      >
        <Controller
          control={control}
          name="datafangstDato"
          render={({ field }) => {
            const date = field.value;

            return (
              <Datepicker
                onChange={(e): void => {
                  const eventDate = new Date(e.target.value);
                  if (eventDate.toDateString() !== date?.toDateString()) {
                    field.onChange(new Date(e.target.value));
                  }
                }}
                defaultSelected={date}
              />
            );
          }}
        />
      </GrenseinformasjonRow>

      <GrenseinformasjonRow
        name="Målemetode"
        tooltipLabel="Metode som ligger til grunn for registrering av posisjon."
        valueLabel={kodeliste ? getMaalemetodeText(kodeliste, getValues("maalemetode")) : getValues("maalemetode")}
        isEditing={isEditing}
      >
        {kodeliste && (
          <Select {...register("maalemetode")}>
            <option value="">Velg målemetode</option>
            {kodeliste.items
              .sort((a, b) => Number(a.kode) - Number(b.kode))
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.kode} {item.label}
                </option>
              ))}
          </Select>
        )}
      </GrenseinformasjonRow>

      <GrenseinformasjonRow
        name="Nøyaktighet (cm)"
        tooltipLabel="Antatt posisjonsnøyaktighet i grunnriss (x, y) oppgitt i cm. Den nøyaktigheten som angis bør være så nær det virkelige objektet som mulig."
        valueLabel={getValues("noeyaktighet")}
        isEditing={isEditing}
      >
        <Input type="number" {...register("noeyaktighet")} />
      </GrenseinformasjonRow>

      <GrenseinformasjonRow
        name="Opphav"
        tooltipLabel="Ansvarlig organisasjon som er opphav til grensedataene."
        valueLabel={getValues("opphav")}
        isEditing={isEditing}
      >
        <Input placeholder="Fyll inn informasjon om opphav" {...register("opphav")} />
      </GrenseinformasjonRow>

      <GrenseinformasjonRow
        name={"Ekstra informasjon"}
        tooltipLabel={"Åpent felt med ekstra informasjon om grensen"}
        valueLabel={getValues("informasjon")}
        isEditing={isEditing}
      >
        {<Textarea placeholder="Fyll inn ekstra informasjon" {...register("informasjon")} />}
      </GrenseinformasjonRow>
    </FormContainer>
  );
};

export default GrenseinformasjonForm;
