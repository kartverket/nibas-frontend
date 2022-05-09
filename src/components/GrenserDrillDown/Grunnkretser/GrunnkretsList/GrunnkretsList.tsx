import ApiGrense from "components/GrenserDrillDown/ApiGrense";
import { useEditGrenser } from "components/GrenserDrillDown/EditGrenserContext";
import useNibasApi from "hooks/useNibasApi";

const GrunnkretserList = () => {
  const { data: grunnkretser } = useNibasApi("/v1/grunnkretser");
  const { values, setObjectValue } = useEditGrenser("grunnkrets");

  return (
    <div>
      {grunnkretser?.map((grunnkrets) => (
        <ApiGrense
          key={grunnkrets.id}
          grense={grunnkrets}
          grenseValue={values[grunnkrets.id]}
          setGrenseValue={setObjectValue}
          type="grunnkrets"
          featuresUrl={`/v1/grunnkretser/${grunnkrets.id}/grenser`}
        />
      ))}
    </div>
  );
};

export default GrunnkretserList;
