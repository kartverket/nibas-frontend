import { Button } from "@kvib/react";
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
    <>
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
      {isEditableFlatedata && <Button>Rediger flatedetaljer</Button>}
    </>
  );
};

const Table = styled.table`
  display: grid;
  grid-template-columns: auto auto 1fr;
  height: 100%;

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

export default KretsTable;
