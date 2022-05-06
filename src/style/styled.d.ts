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
      gray1: string;
      gray2: string;
      grayLight: string;
      blueDark: string;
      blue: string;
      blueLight: string;
      greenDark: string;
      green: string;
      greenLight: string;
      redDark: string;
      redErrorText: string;
      pink: string;
      orange: string;
      yellow: string;
      yellowLight: string;
      white: string;
    };

    dimensions: {
      lg: number;
      lgPx: string;
    };
  }
}
