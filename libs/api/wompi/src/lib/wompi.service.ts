import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { catchError, map, throwError } from 'rxjs';
import {
  IChargeResponse,
  IGetTransactionResponse,
  IMerchantResponse,
  IPaymentSourceResponse,
  IResponseTokenizedCard,
} from './interfaces';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WompiService {
  private readonly baseURL: string = '';
  private readonly publicKey: string = '';
  private readonly privateKey: string = '';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.baseURL = this.configService.getOrThrow<string>('WOMPI_BASE_URL');
    this.publicKey = this.configService.getOrThrow<string>('WOMPI_PUBLIC_KEY');
    this.privateKey =
      this.configService.getOrThrow<string>('WOMPI_PRIVATE_KEY');
  }

  async addCard(): Promise<IResponseTokenizedCard> {
    const url = `${this.baseURL}/tokens/cards`;
    const body = {
      number: '4242424242424242',
      cvc: '789',
      exp_month: '12',
      exp_year: '29',
      card_holder: 'Pedro Pérez',
    };
    return this.httpService
      .post(url, body, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.publicKey}`,
        },
      })
      .pipe(
        map((response) => response.data),
        catchError(this.handleHttpError)
      )
      .toPromise();
  }

  async merchant(): Promise<IMerchantResponse> {
    const url = `${this.baseURL}/merchants/${this.publicKey}`;
    return this.httpService
      .get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.publicKey}`,
        },
      })
      .pipe(
        map((response) => response.data),
        catchError(this.handleHttpError)
      )
      .toPromise();
  }

  async paymentSources(
    tokenType: string,
    token: string,
    customerEmail: string,
    acceptanceToken: string
  ): Promise<IPaymentSourceResponse> {
    const url = `${this.baseURL}/payment_sources`;
    const body = {
      type: tokenType,
      token: token,
      customer_email: customerEmail,
      acceptance_token: acceptanceToken,
    };
    return this.httpService
      .post(url, body, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.privateKey}`,
        },
      })
      .pipe(
        map((response) => response.data),
        catchError(this.handleHttpError)
      )
      .toPromise();
  }

  async charge(
    amount: number,
    email: string,
    reference: string,
    paymentSourceId: string
  ): Promise<IChargeResponse> {
    const url = `${this.baseURL}/transactions`;
    const body = {
      currency: 'COP',
      amount_in_cents: amount * 100,
      customer_email: email,
      payment_method: {
        installments: 1,
      },
      reference: reference,
      payment_source_id: paymentSourceId,
    };

    return this.httpService
      .post(url, body, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.privateKey}`,
        },
      })
      .pipe(
        map((response) => response.data),
        catchError(this.handleHttpError)
      )
      .toPromise();
  }

  async getTransaction(transactionId: string): Promise<IGetTransactionResponse> {
    const url = `${this.baseURL}/transactions/${transactionId}`;
    return this.httpService
      .get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.privateKey}`,
        },
      })
      .pipe(
        map((response) => response.data),
        catchError(this.handleHttpError)
      )
      .toPromise();
  }

  private handleHttpError(error: any) {
    if (error.response && error.response.status === 422) {
      const wompiErrors = error.response.data.error.messages;
      const formattedErrors = Object.keys(wompiErrors)
        .map((key) => `${key}: ${wompiErrors[key].join(', ')}`)
        .join('; ');

      console.error('Wompi API Validation Error:', formattedErrors);
      return throwError(
        () => new Error(`Wompi API Validation Error: ${formattedErrors}`)
      );
    } else {
      console.error('HTTP Error:', error.message);
      return throwError(() => new Error(`HTTP Error: ${error.message}`));
    }
  }
}
