import useFylkesgrenser from "hooks/inndelinger/useFylkesgrenser";
import FylkeList from "./FylkeList";
import EditableGrenseAccordion from "../EditableGrenseAccordion";

const Fylkesgrenser = () => {
  const { fylkesgrenser, isFetching } = useFylkesgrenser();

  return (
    <EditableGrenseAccordion
      features={fylkesgrenser}
      grenseId="fylker"
      grenseType="fylke"
      isFetching={isFetching}
      title="Fylker"
    >
      <FylkeList />
    </EditableGrenseAccordion>
  );
};

export default Fylkesgrenser;
