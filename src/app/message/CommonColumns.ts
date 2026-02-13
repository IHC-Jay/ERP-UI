export interface CommonColumns {
  isSelected: boolean;
  isTableExpanded:boolean;
  id: string;
  CaseNumber: string;
  ItemNumber: string;

  hl7Data: string;

  ProcessDtTm: string;

}

export const CommonColumnsDisplayColumns = [
{key: 'MessageType',
  Order: '1',
  label:'Message Type', TransactionCode: 'All', search: 'NA'},
  {key: 'ProcessDtTm',
  Order: '2',
  label:'Process Date Time', TransactionCode: 'All', search: 'NA'},
    {key: 'MessageControlId',
  Order: '3',
  label:'Message Control ID', TransactionCode: 'All', search: 'Y'},

  {key: 'ItemNumber',
  Order: '4',
  label:'Item Number', TransactionCode: 'All', search: 'Y'},

  {key: 'PurchaseOrder',
  Order: '5',
  label:'Purchase Order', TransactionCode: 'All', search: 'Y'},
  {key: 'TriggerName',
  Order: '6',
  label:'Trigger Name', TransactionCode: 'All', search: 'Y'},
    {key: 'CaseNumber',
  Order: '7',
  label:'Case Number', TransactionCode: 'All', search: 'Y'},
  {key: 'MedicalRecordNumber',
  Order: '8',
  label:'Medical Record Number', TransactionCode: 'All', search: 'Y'},

  {key: 'PatientAccount',
  Order: '9',
  label:'Patient Account', TransactionCode: 'All', search: 'Y'},

  {key: 'SessionID',
  Order: '10',
  label:'Session ID', TransactionCode: 'All', search: 'N'},
  {key: 'SequenceID',
  Order: '11',
  label:'Sequence ID', TransactionCode: 'All', search: 'N'},

  {key: 'SendingApplication',
  Order: '12',
  label:'Sending Application', TransactionCode: 'All', search: 'NA'},
   {key: 'ReceivingApplication',
  Order: '13',
  label:'Receiving Application', TransactionCode: 'All', search: 'NA'},
   {key: 'SendingFacility',
  Order: '14',
  label:'Sending Facility', TransactionCode: 'All', search: 'NA'},
   {key: 'ReceivingFacility',
  Order: '15',
  label:'Receiving Facility', TransactionCode: 'All', search: 'NA'},


];
