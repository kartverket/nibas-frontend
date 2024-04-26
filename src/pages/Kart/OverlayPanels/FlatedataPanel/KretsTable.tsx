import { Button, TabPanel } from "@kvib/react";
import { Inndeling } from "contexts/InndelingerContext/InndelingerContext";
import { styled } from "styled-components";

type Props = {
  inndeling: Inndeling;
};

const KretsTable = ({ inndeling }: Props) => {
  const isFylkeInndeling = inndeling.inndelingtype === "fylke";
  const isEditableFlatedata =
    inndeling.isEditing && inndeling.inndelingtype !== "fylke" && inndeling.inndelingtype !== "kommune";

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
          <tr>
            <td>lorem</td>
            <td>ipsum</td>
            <td>schmipsum</td>
          </tr>
          <tr>
            <td>lorem</td>
            <td>ipsum</td>
            <td>schmipsum</td>
          </tr>
          <tr>
            <td>lorem</td>
            <td>ipsum</td>
            <td>schmipsum</td>
          </tr>
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

const FlatedataFooter = styled.div`
  display: flex;
  padding: 16px;
`;

const EditButton = styled(Button)`
  margin-left: auto;
`;

export default KretsTable;
