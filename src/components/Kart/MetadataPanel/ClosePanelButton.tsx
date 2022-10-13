import { useTranslation } from "react-i18next";
import styled from "styled-components";
import Icon from "components/Icon";
import Button from "components/form/Button";

type Props = {
  onClose: () => unknown;
};

export const ClosePanelButton = ({ onClose }: Props) => {
  const { t } = useTranslation();

  return (
    <StyledCloseButton onClick={onClose} icon={<Icon icon="close" />}>
      {t("action.Lukk")}
    </StyledCloseButton>
  );
};

const StyledCloseButton = styled(Button)`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 100px;
  right: 16px;
  top: 16px;
`;
