export interface IPaymentSourceResponse {
  data: IDataPaymentSource;
}

export interface IDataPaymentSource {
  id: number;
  type: string;
  token: string;
  status: string;
  customer_email: string;
  public_data: IPublicdata;
}

export interface IPublicdata {
  type: string;
}
