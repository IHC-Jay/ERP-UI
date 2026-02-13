export interface TpId {
  isSelected: boolean;
  id: string;
  Name: string;
  AliasName: string;
  TPID: string;
  Type: string;
  isEdit: boolean;
  User :string;
}

export const TpIdColumns = [

  {
    key: 'Name',
    type: 'string',
    label: 'Trading Partner ID',
    required: true,
    help: 'TP Name'
  },
  {
    key: 'AliasName',
    type: 'string',
    label: 'Alias Name',
    help: 'TPID AliasName'
  },
  {
    key: 'TPID',
    type: 'string',
    label: 'TPID',
    required: true,
    help:'TPID value in X12 message'
  },
  {
    key: 'Type',
    type: 'drop',
    label: 'ISA/GS Segment',
    help: 'Value used in ISA, GS or BOTH segments'
  },
  {
    key: 'isEdit',
    type: 'isEdit',
    label: '',
    help:''
  }
];
