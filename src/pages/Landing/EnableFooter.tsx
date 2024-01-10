import { Box, Flex, FooterInline } from "@kvib/react";
import styled from "styled-components";

const EnableFooter = (props: React.PropsWithChildren) => {
  return (
    <Flex direction="column" height="100%">
      <FlexGrowContent>{props.children}</FlexGrowContent>

      <FooterContainer>
        <FooterInline />
      </FooterContainer>
    </Flex>
  );
};

const FlexGrowContent = styled.div`
  flex-grow: 1;
`;

const FooterContainer = styled(Box)`
  padding: 0 50px 15px 55px;
  background-color: white;
`;

export default EnableFooter;
