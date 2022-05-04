import React from "react";
import { useTranslation } from "react-i18next";
import styled, { css } from "styled-components";
import { TabDictionary } from "./useTabs";
import Button from "components/form/Button";
import { Translation } from "i18n";

type TabsProps<T extends string> = {
  children: React.ReactNode;
  tabIds: TabDictionary<T>;
  openTab: (tab: T) => void;
  selectedTab: T;
};

const Tabs = <T extends string>({
  children,
  tabIds,
  openTab,
  selectedTab,
}: TabsProps<T>) => {
  const { t } = useTranslation();

  return (
    <div>
      <TabsWrapper>
        {Object.keys(tabIds).map((tabId) => (
          <TabButton
            key={tabId}
            onClick={() => openTab(tabId as T)}
            selected={(tabId as T) === selectedTab}
          >
            {t(`inndelinger.${tabId}` as Translation)}
          </TabButton>
        ))}
      </TabsWrapper>
      {children}
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
