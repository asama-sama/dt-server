// import { Emission } from "../db/models/Emission";

// export const getYears = async () => {
//   const years = (
//     await Emission.findAll({
//       attributes: ["year"],
//       group: "year",
//       order: [["year", "ASC"]],
//     })
//   ).map((emission) => emission.year);
//   return years;
// };
