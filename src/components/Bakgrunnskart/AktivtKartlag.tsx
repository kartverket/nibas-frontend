// import React, { forwardRef, ReactElement, useState } from "react";
// import styled from "styled-components";
// import Slider from "components/form/Slider";

// import { MainMappedLayer, MappedLayer } from "utils/getLayersFromWMS";
// import Icon from "components/Icon";

// type SharedProps = {
//   indent: number;
//   onVisibilityClick: () => void;
//   visible: boolean;
//   propertiesVisible?: boolean;
//   isAktiveKartlag?: boolean;
//   children: React.ReactNode;
// };

// type MainLayerProps = SharedProps & {
//   mappedLayer: MainMappedLayer;
//   isMainLayer: true;
// };

// type SubLayerProps = SharedProps & {
//   mappedLayer: MappedLayer;
//   isMainLayer?: false | undefined;
// };

// type Props = MainLayerProps | SubLayerProps;

// const AktivtKartlag = () => {
//   // (props, ref) => {
//   //     const {
//   //         indent,
//   //         visible,
//   //         onVisibilityClick,
//   //         propertiesVisible,
//   //         isAktiveKartlag,
//   //         children,
//   //       } = props;
//   // }
//   // const { opacity, onSliderChange } = useLayerOpacity({
//   //     mappedLayer: props.mappedLayer,
//   //     isMainLayer: props.isMainLayer,
//   //   });

//   return (
//     <DraggableLayer>
//       <span>
//         <Icon icon="reorder" aria-label={`Bytt rekkefølge på kartlag`} />
//         <span>Grunnkretser</span>
//       </span>
//       <span>
//         <OpacitySlider max={100} min={0} value={50} />
//         <Icon icon="remove" aria-label={`Fjern fra aktive kartlag`} />
//       </span>
//     </DraggableLayer>
//   );
// };

// const DraggableLayer = styled.span`
//   display: flex;
//   flex: 1;
//   align-items: center;
//   justify-content: space-between;
//   margin: 8px 0;
//   cursor: move;

//   > :first-child {
//     flex: 1;
//     display: flex;
//     flex-direction: row;
//     align-items: center;
//     justify-content: left;
//   }

//   > span {
//     display: flex;
//     flex-direction: row;
//     align-items: center;
//     justify-content: right;

//     > :first-child {
//       margin-right: 8px;
//     }
//   }
// `;

// const OpacitySlider = styled(Slider)`
//   width: 60%;
//   /* background: ${({ theme }) => theme.colors.blueDark}; */
//   cursor: pointer;
// `;

// export default AktivtKartlag;
export {};
