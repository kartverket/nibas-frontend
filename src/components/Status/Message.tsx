import styled from "styled-components";
import Icon from "../Icon";
import { Status, StatusStyle, statusStyles } from "./common";

const Container = styled.div<StatusStyle>`
  display: flex;
  align-items: center;
  gap: 4px;
  background: ${(props) => props.background};
  color: ${(props) => props.foreground};
  border: 1px solid;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: normal;
  width: 100%;

  & > ${Icon} {
    font-size: 18px;
  }
`;

const StatusIcon = styled(Icon).attrs((props) => ({
  icon: props.icon,
}))<StatusStyle>`
  font-size: 36px;
  color: ${(props) => props.foreground};
`;

type Props = {
  children: React.ReactNode;
  status: Status;
};

const Message = ({ children, status }: Props) => {
  return (
    <Container {...statusStyles[status]}>
      <StatusIcon {...statusStyles[status]} />
      {children}
    </Container>
  );
};

export default Message;
