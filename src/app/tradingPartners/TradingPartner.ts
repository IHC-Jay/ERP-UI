export interface TradingPartner {
  isSelected: boolean;
  id: string;
  Name: string;
  TPtype: string;
  BusinessContact: string;
  CommunicationContact: string;
  Folder: string;
  CommunicationProtocol: string;
  InterchangeIdQualifier: string;
  PartnerInterchangeIdQualifier: string;
  User:string;
  isEdit: boolean;
}

export const TradingPartnerColumns = [
   {
    key: 'Name',
    type: 'text',
    label: 'Trading Partner',
    required: true,
  },
  {
    key: 'TPtype',
    type: 'text',
    label: 'Trading Type',
    required: true,
  },

  {
    key: 'Folder',
    type: 'text',
    label: 'Folder',
    required: true,
  },
  {
    key: 'CommunicationProtocol',
    type: 'text',
    label: 'Communication Protocol',
    required: true,
  },
  {
    key: 'InterchangeIdQualifier',
    type: 'text',
    label: 'InterchangeId Qualifier'
  },
  {
    key: 'PartnerInterchangeIdQualifier',
    type: 'text',
    label: 'PartnerInterchangeId Qualifier'
  },
  {
    key: 'CommunicationContact',
    type: 'text',
    label: 'Communication Contact',
  },
  {
    key: 'BusinessContact',
    type: 'text',
    label: 'Business Contact'
  },
  {
    key: 'Notes',
    type: 'text',
    label: 'Notes'
  },
  {
    key: 'isEdit',
    type: 'isEdit',
    label: '',
  },
];
