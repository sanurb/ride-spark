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
  payment_method: Paymentmethod;
  shipping_address: Shippingaddress;
  redirect_url: string;
  payment_link_id?: any;
}

export interface Shippingaddress {
  address_line_1: string;
  country: string;
  region: string;
  city: string;
  phone_number: number;
}

export interface Paymentmethod {
  type: string;
  phone_number: number;
}
