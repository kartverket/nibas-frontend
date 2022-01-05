import {
  fetchFylkesnumre,
  fetchKommunenumre,
  fetchMaalemetodeKoder,
} from "../../api/kodelister";
import KodelisteSelect from "components/KodelisteSelect/KodelisteSelect";

const KodelistePreview = () => {
  return (
    <div>
      <div>
        <KodelisteSelect
          id="kommunenummerDropdown"
          label="Velg et kommunenummer:"
          name="kommunenummerName"
          showSelectedText={true}
          fetchKodeListeFunction={fetchKommunenumre}
        />
      </div>
      <div>
        <KodelisteSelect
          id="fylkesnummerDropdown"
          label="Velg et fylkesnummer:"
          name="fylkesnummerName"
          selectedValue="77c14c5f-51ea-4b80-8746-32035193b811"
          fetchKodeListeFunction={fetchFylkesnumre}
        />
      </div>
      <div>
        <KodelisteSelect
          id="maalemetodeKoderDropdown"
          label="Velg en målemetode:"
          name="maalemetodeName"
          fetchKodeListeFunction={fetchMaalemetodeKoder}
        />
      </div>
    </div>
  );
};

export default KodelistePreview;
