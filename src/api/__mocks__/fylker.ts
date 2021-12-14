import * as fylkerApi from "../fylker";
import { MockedModule } from "test/types";

const mock = jest.createMockFromModule("../fylker") as MockedModule<
  typeof fylkerApi
>;

mock.fetchFylker.mockResolvedValue([
  { type: "FYLKE", id: 1, navn: "Viken", nummer: "30" },
  { type: "FYLKE", id: 2, navn: "Innlandet", nummer: "34" },
]);

mock.fetchFylkeFeaturesById.mockResolvedValue({
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        id: 3,
        navn: "viken_og_innlandet_grense",
        type: "FYLKE",
        administrativEnhet: {
          type: "FYLKE",
          id: 1,
          navn: "Viken",
          nummer: "30",
        },
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [209895.43268598442, 6874687.984379287],
          [211172.23122919415, 6875366.619199999],
          [211159.5807131484, 6876177.451462617],
          [209569.16963786847, 6878081.226561763],
          [210609.98203931408, 6878957.403017106],
          [212455.38700994628, 6880510.901403168],
          [212013.36372773623, 6883402.173303616],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: 1,
        navn: "viken_grense",
        type: "FYLKE",
        administrativEnhet: {
          type: "FYLKE",
          id: 1,
          navn: "Viken",
          nummer: "30",
        },
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [151552.31768913998, 6856728.632614035],
          [164914.38462092626, 6856071.953562445],
          [164574.1089717507, 6845268.201701121],
          [177419.5147281277, 6851223.025561694],
          [177138.79093241104, 6854253.410312524],
          [179205.9618862993, 6855731.67791327],
          [179205.9618862993, 6850967.818824812],
          [182268.44272887925, 6852754.265982984],
          [188507.58954992722, 6841856.478432098],
          [200983.60343353444, 6848160.544719114],
          [173336.2069380211, 6867641.325634414],
          [206486.05480473157, 6865081.983734359],
          [206416.22673623555, 6866285.738400699],
          [208265.3178440797, 6870751.274085945],
          [209895.43268598442, 6874687.984379287],
        ],
      },
    },
  ],
});

module.exports = mock;

// er ikke en mock, returnerer riktige verdier
// export const fetchFylker = () => {
//   console.log("Fetch in mock");
//   return Promise.resolve([
//     { type: "FYLKE", id: 1, navn: "Viken", nummer: "30" },
//     { type: "FYLKE", id: 2, navn: "Innlandet", nummer: "34" },
//   ]);
// };

// er mock, klarer ikke returnere riktige verdier når kalles
// export const fetchFylker = jest.fn(() => {
//   console.log("Fetch in mock");
//   return [
//     { type: "FYLKE", id: 1, navn: "Viken", nummer: "30" },
//     { type: "FYLKE", id: 2, navn: "Innlandet", nummer: "34" },
//   ];
// });

// export const fetchFylkeFeaturesById = async (id: number) => ({
//   type: "FeatureCollection",
//   features: [
//     {
//       type: "Feature",
//       properties: {
//         id: 3,
//         navn: "viken_og_innlandet_grense",
//         type: "FYLKE",
//         administrativEnhet: {
//           type: "FYLKE",
//           id: 1,
//           navn: "Viken",
//           nummer: "30",
//         },
//       },
//       geometry: {
//         type: "LineString",
//         coordinates: [
//           [209895.43268598442, 6874687.984379287],
//           [211172.23122919415, 6875366.619199999],
//           [211159.5807131484, 6876177.451462617],
//           [209569.16963786847, 6878081.226561763],
//           [210609.98203931408, 6878957.403017106],
//           [212455.38700994628, 6880510.901403168],
//           [212013.36372773623, 6883402.173303616],
//         ],
//       },
//     },
//     {
//       type: "Feature",
//       properties: {
//         id: 1,
//         navn: "viken_grense",
//         type: "FYLKE",
//         administrativEnhet: {
//           type: "FYLKE",
//           id: 1,
//           navn: "Viken",
//           nummer: "30",
//         },
//       },
//       geometry: {
//         type: "LineString",
//         coordinates: [
//           [151552.31768913998, 6856728.632614035],
//           [164914.38462092626, 6856071.953562445],
//           [164574.1089717507, 6845268.201701121],
//           [177419.5147281277, 6851223.025561694],
//           [177138.79093241104, 6854253.410312524],
//           [179205.9618862993, 6855731.67791327],
//           [179205.9618862993, 6850967.818824812],
//           [182268.44272887925, 6852754.265982984],
//           [188507.58954992722, 6841856.478432098],
//           [200983.60343353444, 6848160.544719114],
//           [173336.2069380211, 6867641.325634414],
//           [206486.05480473157, 6865081.983734359],
//           [206416.22673623555, 6866285.738400699],
//           [208265.3178440797, 6870751.274085945],
//           [209895.43268598442, 6874687.984379287],
//         ],
//       },
//     },
//   ],
// });

// export const updateFylkeFeatures = async (newFeatures: Feature<Geometry>[]) => {
//   // gjør ingenting, dette er api specific
// };
