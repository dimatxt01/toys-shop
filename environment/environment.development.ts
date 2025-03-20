import { DataInterface } from "./environment.types";

export const environment: DataInterface = {
  name: "development",
  baseUrl: process.env.BASE_URL ?? "",
  data: {
    "Forward Headquarters": {
      id: "part_2epduuFmozVrpasITBJSeKKx1d4",
      name: "Forward Headquarters",
      accounts: [
        {
          id: "acct_2eqnpi1OlmRox0TMpTzILDHbBOu",
        },
      ],
    },
    "Fiserv Test": {
      id: "part_2VGhmQRZUbeSQyAukRNYfLDJmNb",
      name: "Fiserv Test",
      accounts: [{ id: "acct_2VHH7rChwnuVv241SLrlBkkIsRJ" }],
    },
  },
};