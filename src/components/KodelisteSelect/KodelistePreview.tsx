import styled from "styled-components";
import {
  fetchFylkesnumre,
  fetchKommunenumre,
  fetchMaalemetodeKoder,
} from "../../api/kodelister";
import KodelisteSelect from "components/KodelisteSelect/KodelisteSelect";

const KodelistePreview = () => {
  return (
    <KodelistePreviewPanel>
      <div>
        <KodelisteSelect
          id="kommunenummerDropdown"
          label="Kommunenummer"
          name="kommunenummerName"
          fetchKodeListeFunction={fetchKommunenumre}
        />
      </div>
      <div>
        <KodelisteSelect
          id="fylkesnummerDropdown"
          label="Fylkesnummer"
          name="fylkesnummerName"
          fetchKodeListeFunction={fetchFylkesnumre}
        />
      </div>
      <div>
        <KodelisteSelect
          id="maalemetodeKoderDropdown"
          label="Målemetode"
          name="maalemetodeName"
          fetchKodeListeFunction={fetchMaalemetodeKoder}
        />
      </div>
    </KodelistePreviewPanel>
  );
};

const KodelistePreviewPanel = styled.div`
  margin-top: 16px;
  margin-bottom: 16px;
`;

export default KodelistePreview;
