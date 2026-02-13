export interface DisplayColumns {
  id: string;
  TransactionCode: string;
  key: string;
  Order: number;
}

export interface DisplayColumnsArray {
  displayColumns: DisplayColumns[];
  User: string;
}
