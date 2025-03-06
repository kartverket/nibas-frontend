import { HeaderSection } from "./HeaderButton";
import { useDisclosure, Text, Button } from "@kvib/react";
import VelgVisningsdatoModal from "components/Modals/VelgVisningsdatoModal";
import { styled } from "styled-components";
import { useValgtGyldighetsdato } from "contexts/GyldighetsdatoContext";
import { format, isToday } from "date-fns";

const HeaderVelgGyldighetsdato = () => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { gyldighetsdato } = useValgtGyldighetsdato();

  const getDatoText = (dato: string | null | undefined): string => {
    if (dato == null) {
      return "dagens dato";
    }
    const datoAsDate = new Date(dato);
    return isToday(datoAsDate) ? "dagens dato" : format(datoAsDate, "dd.MM.yyyy");
  };

  return (
    <HeaderSection>
      <Text>
        Viser inndelinger som er gyldig fra <DatoText>{getDatoText(gyldighetsdato)}</DatoText>
      </Text>
      <Button size="sm" variant="ghost" leftIcon="calendar_today" onClick={onOpen}>
        Velg dato
      </Button>
      <VelgVisningsdatoModal isOpen={isOpen} onClose={onClose} />
    </HeaderSection>
  );
};

const DatoText = styled.span`
  font-weight: 900;
`;

export default HeaderVelgGyldighetsdato;
