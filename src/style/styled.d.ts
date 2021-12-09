// https://styled-components.com/docs/api#typescript
// import original module declarations
import "styled-components";

// and extend them!
declare module "styled-components" {
  export interface DefaultTheme {
    colors: {
      black: string;
      grayDark: string;
      gray: string;
      grayLight: string;
      blueDark: string;
      blue: string;
      blueLight: string;
      greenDark: string;
      green: string;
      greenLight: string;
      redDark: string;
      pink: string;
      orange: string;
      yellow: string;
      yellowLight: string;
      white: string;
    };
  }
}
