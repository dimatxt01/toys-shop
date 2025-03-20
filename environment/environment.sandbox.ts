import { DataInterface } from "./environment.types";

export const environment: DataInterface = {
  name: "sandbox",
  baseUrl: process.env.BASE_URL ?? "",
  data: {
    "Forward Headquarters": {
      id: "part_sandbox_FHQ123456789",
      name: "Forward Headquarters",
      accounts: [
        {
          id: "acct_sandbox_FHQ987654321",
        },
      ],
    },
    "Fiserv Test": {
      id: "part_sandbox_FIS123456789",
      name: "Fiserv Test",
      accounts: [{ id: "acct_sandbox_FIS987654321" }],
    },
    "Sandbox Partner": {
      id: "part_sandbox_SP123456789",
      name: "Sandbox Partner",
      accounts: [{ id: "acct_sandbox_SP987654321" }],
    },
  },
};