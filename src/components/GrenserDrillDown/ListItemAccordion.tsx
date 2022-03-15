import Accordion from "../Accordion";

const ListItemAccordion = (props: React.ComponentProps<typeof Accordion>) => {
  return (
    <li>
      <Accordion {...props} />
    </li>
  );
};

export default ListItemAccordion;
