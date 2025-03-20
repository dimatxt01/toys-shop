export interface Account {
  id: string;
}

export interface Partner {
  id: string;
  name: string;
  accounts: Account[];
}

export interface PartnerData {
  [key: string]: Partner;
}

export interface DataInterface {
  name: string;
  baseUrl: string;
  data: PartnerData;
}