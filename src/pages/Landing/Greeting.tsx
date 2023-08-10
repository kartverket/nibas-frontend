import { Heading, Text } from "@kvib/react";
import styled from "styled-components";

const getGreetingFromDate = (date: Date) => {
  const hours = date.getHours();
  if (hours > 18) {
    return "kveld";
  } else if (hours > 12) {
    return "ettermiddag";
  } else {
    return "morgen";
  }
};

const Greeting = () => {
  const contextualGreeting = getGreetingFromDate(new Date());

  return (
    <Container>
      <Text as="b">God {contextualGreeting}!</Text> Hva har du lyst til å gjøre
      nå?
    </Container>
  );
};

const Container = styled(Heading).attrs({ size: "md" })`
  margin-bottom: 16px;
  font-weight: normal;
`;

export default Greeting;
