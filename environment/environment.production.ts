import { DataInterface } from "./environment.types";

export const environment: DataInterface = {
  name: "production",
  baseUrl: process.env.BASE_URL ?? "",
  data: {
    "Forward Headquarters": {
      id: "part_2WDhRPDKRgRoU33S3YkfqQW2zAm",
      name: "Forward Headquarters",
      accounts: [
        {
          id: "acct_2aorxg0o7a3ggwiU0RNQPiOPWAm",
        },
      ],
    },
    "Fiserv": {
      id: "part_2WGk0PD0M2fkcX80rPyixhbMMvU",
      name: "Fiserv",
      accounts: [
        {
          id: "acct_2WP8naFNyTsvnKBdShx19qhCYO6",
        },
        {
          id: "acct_2WPWVoLFlAqezduyqxjROHe2I9Y",
        },
        {
          id: "acct_2WdGNQIK9h0bPFh33wX4quE5weF",
        },
        {
          id: "acct_2YB5cR9PiEJV6X3o0Tpe0TiffDm",
        },
        {
          id: "acct_2YB7G8btH6tf3j8epPpybSo04ae",
        }
      ],
    },
  },
};