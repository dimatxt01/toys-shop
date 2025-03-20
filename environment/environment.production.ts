import { DataInterface } from "./environment.types";

export const environment: DataInterface = {
  name: "production",
  baseUrl: process.env.BASE_URL ?? "",
  data: {
    "Forward Headquarters": {
      id: "part_prod_FHQ123456789",
      name: "Forward Headquarters",
      accounts: [
        {
          id: "acct_prod_FHQ987654321",
        },
      ],
    },
    "Fiserv": {
      id: "part_prod_FIS123456789",
      name: "Fiserv",
      accounts: [{ id: "acct_prod_FIS987654321" }],
    },
    "Enterprise Partner": {
      id: "part_prod_EP123456789",
      name: "Enterprise Partner",
      accounts: [{ id: "acct_prod_EP987654321" }],
    },
  },
};