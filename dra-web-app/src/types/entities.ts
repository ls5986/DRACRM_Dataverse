// Client entity interface
export interface Client {
  dra_clientid: string;
  dra_firstname: string;
  dra_lastname: string;
  dra_name: string;
  dra_email: string;
  dra_phone: string;
  dra_address: string;
  dra_city: string;
  dra_state: string;
  dra_zip: string;
  dra_ssn: string;
  dra_dob: string;
  dra_employer: string;
  dra_income: number;
  dra_enrollmentdate: string;
  dra_createdon: string;
  dra_modifiedon: string;
  statecode: number;
  statuscode: number;
}

// Debt Account entity interface
export interface DebtAccount {
  dra_debtaccountid: string;
  dra_name: string;
  dra_accountnumber: string;
  dra_creditor: string;
  dra_balance: number;
  dra_interestrate: number;
  dra_payment: number;
  dra_clientid: string;
  dra_createdon: string;
  dra_modifiedon: string;
  statecode: number;
  statuscode: number;
}

// Client Note entity interface
export interface ClientNote {
  dra_clientnoteid: string;
  dra_name: string;
  dra_note: string;
  dra_clientid: string;
  dra_createdon: string;
  dra_modifiedon: string;
  statecode: number;
  statuscode: number;
}

// Deal entity interface
export interface Deal {
  dra_dealid: string;
  dra_name: string;
  dra_clientid: string;
  dra_debtaccountid: string;
  dra_amount: number;
  dra_fee: number;
  dra_status: number;
  dra_createdon: string;
  dra_modifiedon: string;
  statecode: number;
  statuscode: number;
}

// Credit Pull entity interface
export interface CreditPull {
  dra_creditpullid: string;
  dra_name: string;
  dra_clientid: string;
  dra_score: number;
  dra_report: string;
  dra_createdon: string;
  dra_modifiedon: string;
  statecode: number;
  statuscode: number;
} 