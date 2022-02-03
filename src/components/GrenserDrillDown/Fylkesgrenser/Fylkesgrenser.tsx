import FylkeList from "./FylkeList";
import Accordion from "components/Accordion";

const Fylkesgrenser = () => {
  return (
    <Accordion title="Fylkesgrenser">
      <div>
        <FylkeList />
      </div>
    </Accordion>
  );
};

export default Fylkesgrenser;
