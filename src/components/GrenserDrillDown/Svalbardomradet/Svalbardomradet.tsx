import Accordion from "components/Accordion";
import KodelistePreview from "components/KodelisteSelect/KodelistePreview";

const Svalbardomradet = () => {
  return (
    <Accordion title="Svalbardområdet">
      {/* Kun for test/displayformål. */}
      <KodelistePreview />
    </Accordion>
  );
};

export default Svalbardomradet;
