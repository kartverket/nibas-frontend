import { Badge, Button, TabPanel } from "@kvib/react";
import { Inndeling } from "contexts/InndelingerContext/InndelingerContext";
import { styled } from "styled-components";
import { useFlatedata } from "./useFlatedata";
import { getIdFromEntity } from "utils/api";
import { getNavnInSpraak } from "utils/language/language";

type Props = {
  inndeling: Inndeling;
};

const KretsTable = ({ inndeling }: Props) => {
  const isFylkeInndeling = inndeling.inndelingtype === "fylke";
  const isEditableFlatedata =
    inndeling.isEditing && inndeling.inndelingtype !== "fylke" && inndeling.inndelingtype !== "kommune";

  const flatedata = useFlatedata(inndeling) ?? [];

  return (
    <Container>
      <Table>
        <thead>
          <tr>
            <th>{isFylkeInndeling ? "Fylkesnummer" : "Kommunenummer"}</th>
            <th>{isFylkeInndeling ? "Fylkesnavn" : "Kommunenavn"}</th>
            <th>Merknad</th>
          </tr>
        </thead>
        <tbody>
          {flatedata.map((krets) => (
            <tr key={getIdFromEntity(krets)}>
              <td>{krets.nummer}</td>
              <td>{getNavnInSpraak(krets.navn, "nor")}</td>
              <td>
                {"samiskforvaltningsomraade" in krets
                  ? krets.samiskforvaltningsomraade && <Merknad>Samisk forvaltningsområde</Merknad>
                  : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      {isEditableFlatedata && (
        <FlatedataFooter>
          <EditButton rightIcon="edit_note">Rediger flatedetaljer</EditButton>
        </FlatedataFooter>
      )}
    </Container>
  );
};

const Container = styled(TabPanel)`
  padding: 0;
  height: 100%;
  display: grid;
  grid-template-rows: 1fr auto;
  overflow: hidden;
`;

const Table = styled.table`
  display: grid;
  grid-template-columns: auto auto 1fr;
  grid-auto-rows: max-content;
  width: 100%;
  overflow: auto;

  thead,
  tbody,
  tr {
    display: contents;
  }

  th {
    font-weight: normal;
    text-align: left;
  }

  th,
  td {
    padding: 12px 18px;
    border-bottom: 1px solid var(--kvib-colors-chakra-border-color);
  }
`;

const Merknad = styled(Badge)`
  display: inline-flex;
  align-items: center;
  height: 100%;
  padding: 0 8px;
  text-transform: unset;
  vertical-align: unset;
  border-radius: 6px;
  background: var(--kvib-colors-orange-100);
`;

const FlatedataFooter = styled.div`
  display: flex;
  padding: 16px;
  border-top: 1px solid var(--kvib-colors-chakra-border-color);
`;

const EditButton = styled(Button)`
  margin-left: auto;
`;

export default KretsTable;
