export interface IChargeResponse {
  data: IDataCharge;
}

export interface IDataCharge {
  id: string;
  created_at: string;
  amount_in_cents: number;
  status: string;
  reference: string;
  customer_email: string;
  currency: string;
  payment_method_type: string;
  payment_method: IPaymentmethod;
  shipping_address: IShippingaddress;
  redirect_url: string;
  payment_link_id?: any;
}

export interface IShippingaddress {
  address_line_1: string;
  country: string;
  region: string;
  city: string;
  phone_number: number;
}

export interface IPaymentmethod {
  type: string;
  phone_number: number;
}

export interface IGetTransactionResponse {
  data: IDataGetTransactionResponse;
  meta: IMetaGetTransactionResponse;
}

export interface IMetaGetTransactionResponse {
  [key: string]: string;
}

export interface IDataGetTransactionResponse {
  id: string;
  created_at: string;
  finalized_at: string;
  amount_in_cents: number;
  reference: string;
  currency: string;
  payment_method_type: string;
  payment_method: IPaymentmethodIGetTransactionResponse;
  payment_link_id?: any;
  redirect_url?: any;
  status: string;
  status_message: string;
  merchant: IMerchantGetTransactionResponse;
  taxes: any[];
  tip_in_cents?: any;
}

export interface IMerchantGetTransactionResponse {
  id: number;
  name: string;
  legal_name: string;
  contact_name: string;
  phone_number: string;
  logo_url?: any;
  legal_id_type: string;
  email: string;
  legal_id: string;
  public_key: string;
}

export interface IPaymentmethodIGetTransactionResponse {
  type: string;
  extra: IExtra;
  installments: number;
}

export interface IExtra {
  name: string;
  brand: string;
  card_type: string;
  last_four: string;
  is_three_ds: boolean;
  unique_code?: any;
  three_ds_auth?: any;
  external_identifier: string;
  processor_response_code: string;
}
