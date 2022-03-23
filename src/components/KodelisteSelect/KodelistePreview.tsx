import styled from "styled-components";
import KodelisteSelect from "components/KodelisteSelect/KodelisteSelect";

const KodelistePreview = () => {
  return (
    <KodelistePreviewPanel>
      <div>
        <KodelisteSelect
          id="kommunenummerDropdown"
          label="Kommunenummer"
          name="kommunenummerName"
          kodelisteUrl="/v1/kodeliste/kommunenumre"
        />
      </div>
      <div>
        <KodelisteSelect
          id="fylkesnummerDropdown"
          label="Fylkesnummer"
          name="fylkesnummerName"
          kodelisteUrl="/v1/kodeliste/fylkesnumre"
        />
      </div>
      <div>
        <KodelisteSelect
          id="maalemetodeKoderDropdown"
          label="Målemetode"
          name="maalemetodeName"
          kodelisteUrl="/v1/kodeliste/maalemetode-koder"
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
