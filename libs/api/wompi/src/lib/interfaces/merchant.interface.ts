export interface IMerchantResponse {
  data: IDataMerchantResponse;
  meta: Meta;
}

export interface Meta {
  [key: string]: string;
}

export interface IDataMerchantResponse {
  id: number;
  name: string;
  email: string;
  contact_name: string;
  phone_number: string;
  active: boolean;
  logo_url?: any;
  legal_name: string;
  legal_id_type: string;
  legal_id: string;
  public_key: string;
  accepted_currencies: string[];
  fraud_javascript_key?: any;
  fraud_groups: any[];
  accepted_payment_methods: string[];
  payment_methods: IMerchantPaymentmethod[];
  presigned_acceptance: IPresignedacceptance;
}

export interface IPresignedacceptance {
  acceptance_token: string;
  permalink: string;
  type: string;
}

export interface IMerchantPaymentmethod {
  name: string;
  payment_processors: IPaymentprocessor[];
}

export interface IPaymentprocessor {
  name: string;
}
