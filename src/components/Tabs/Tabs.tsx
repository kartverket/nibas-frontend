import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import styled, { css } from "styled-components";
import Button from "components/form/Button";
import { Translation } from "i18n";

type Props = {
  children: React.ReactNode;
  tabTransKeys: string[];
  className?: string;
};

const Tabs = ({ children, tabTransKeys, className }: Props) => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState<number>(0);

  const openTab = (index: number) => {
    setSelectedTab(index);
  };

  return (
    <div className={className}>
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

const TabsWrapper = styled.div``;

const TabButton = styled(Button).attrs(() => ({
  variant: "unstyled",
}))<{ selected: boolean }>`
  border-bottom: none;
  padding: 8px;
  transition: 0.1s border-bottom;
  border-bottom: 2px solid transparent;

  &:hover {
    border-bottom: 2px solid var(--blue_light);
  }

  ${({ selected }) =>
    selected &&
    css`
      border-bottom: 2px solid var(--blue_dark);

      &:hover {
        border-bottom: 2px solid var(--blue_dark);
      }
    `}
`;

export default Tabs;
