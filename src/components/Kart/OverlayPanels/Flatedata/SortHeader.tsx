import Icon from "components/Icon/Icon";
import Button from "components/form/Button";
import styled from "styled-components";

const Container = styled(Button)<{ isActive: boolean }>`
  color: ${(props) => (props.isActive ? "var(--blue)" : "var(--gray_dark)")};

  &:hover {
    color: var(--black);

    .material-symbols-outlined {
      background: var(--gray_light);
    }
  }

  .material-symbols-outlined {
    border-radius: 4px;
    margin-left: 6px;
    background: ${(props) => props.isActive && "var(--blue_light)"};
  }
`;

type Props = {
  children: React.ReactNode;
  onClick: () => void;
  isActive: boolean;
  isReversed: boolean;
};

const SortHeader = ({ children, onClick, isActive, isReversed }: Props) => {
  return (
    <th>
      <Container
        isActive={isActive}
        onClick={onClick}
        variant="unstyled"
        icon={
          isReversed ? (
            <Icon icon="arrow_drop_up" />
          ) : (
            <Icon icon="arrow_drop_down" />
          )
        }
      >
        {children}
      </Container>
    </th>
  );
};

export default SortHeader;
