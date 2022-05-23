import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import styled, { css } from "styled-components";
import Button from "components/form/Button";
import { Translation } from "i18n";

type Props = {
  children: React.ReactNode;
  tabTransKeys: string[];
};

const Tabs = ({ children, tabTransKeys }: Props) => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState<number>(0);

  const openTab = (index: number) => {
    setSelectedTab(index);
  };

  return (
    <div>
      <TabsWrapper>
        {tabTransKeys.map((tabTransKey, index) => (
          <TabButton
            key={tabTransKey}
            onClick={() => openTab(index)}
            selected={selectedTab === index}
          >
            {t(tabTransKey as Translation)}
          </TabButton>
        ))}
      </TabsWrapper>
      {React.Children.map(children, (child, index) =>
        selectedTab === index ? child : null
      )}
    </div>
  );
};

const TabsWrapper = styled.div`
  border-bottom: 4px solid ${({ theme }) => theme.colors.blueDark};
`;

const TabButton = styled(Button).attrs(() => ({
  variant: "unstyled",
}))<{ selected: boolean }>`
  border: 2px solid ${({ theme }) => theme.colors.blueDark};
  border-bottom: none;
  margin-right: 8px;
  padding: 4px 8px;
  border-radius: 4px 4px 0 0;
  transition: 0.1s all;

  ${({ selected }) =>
    selected &&
    css`
      background-color: ${({ theme }) => theme.colors.blueDark};
      color: white;
    `}
`;

export default Tabs;
