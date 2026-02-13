export interface CommonColumns {
  isSelected: boolean;
  isTableExpanded:boolean;
  id: string;
  ApplicationReceiversCode: string;
  ApplicationSendersCode: string;

  FileName: string;
  GroupControlNumber: string;
  InterchangeControlNumber: string;
  InterchangeDate: string;
  Receiver: string;
  Sender: string;
  InterchangeTime: string;
  ProcessDtTm: string;

}

export const CommonColumnsDisplayColumns = [
  {key: 'InterchangeControlNumber',
  type: 'text',
  label:'Interchange ControlNumber'},
  {key: 'Sender',
  type: 'text',
  label:'Interchange Sender'},
  {key: 'Receiver',
  type: 'text',
  label:'Interchange Receiver'},
  {key: 'InterchangeDate',
  type: 'text',
  label:'InterchangeDate'},
  {key: 'InterchangeTime',
  type: 'text',
  label:'InterchangeTime'},
  {key: 'ProcessDtTm',
  type: 'text',
  label:'ProcessDtTm'},
  {key: 'GroupControlNumber',
  type: 'text',
  label:'GroupControlNumber'},
  {key: 'TransactionControlNumber',
    type: 'text',
    label:'TransactionControlNumber'},
  {key: 'ApplicationSendersCode',
  type: 'text',
  label:'ApplicationSendersCode'},
  {key: 'ApplicationReceiversCode',
  type: 'text',
  label:'ApplicationReceiversCode'},

  {key: 'FileName',
  type: 'text',
  label:'FileName'}

];
