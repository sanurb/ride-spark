import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { catchError, map, of } from 'rxjs';

@Injectable()
export class WompiService {
  private readonly baseURL: string = 'https://sandbox.wompi.co/v1';
  private readonly publicKey: string =
    'pub_test_u0eNRocWNEOhYJ9VqtxRKBFca75IalYc';
  private readonly privateKey: string =
    'prv_test_FfSdfrhVJ1yXKa8763QIIezvRQTeLvYK';

  constructor(private readonly httpService: HttpService) {}

  async addCard() {
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
      .pipe(map((response) => response.data))
      .toPromise();
  }

  async merchant() {
    const url = `${this.baseURL}/merchants/${this.publicKey}`;
    return this.httpService.get(url, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.publicKey}`,
        },
    }).pipe(map(response => response.data)).toPromise();
}

  async paymentSources(tokenType: string, token: string, customerEmail: string, acceptanceToken: string) {
      const url = `${this.baseURL}/payment_sources`;
      const body = {
          type: tokenType,
          token: token,
          customer_email: customerEmail,
          acceptance_token: acceptanceToken
      };
      return this.httpService.post(url, body, {
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.privateKey}`
          }
      }).pipe(
        map(response => response.data),
        catchError(error => {
            console.error('Error occurred while processing payment sources:', error);
            return of(`Failed to process payment sources due to error: ${error.message}`);
        })
    ).toPromise();
  }

  async charge(amount: number, email: string, reference: string, paymentSourceId: string) {
    const url = `${this.baseURL}/transactions`;
    const body = {
        amount_in_cents: amount * 100,
        customer_email: email,
        payment_method: {
            installments: 1
        },
        reference: reference,
        payment_source_id: paymentSourceId
    };
    return this.httpService.post(url, body, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.privateKey}`
        }
    }).pipe(map(response => response.data)).toPromise();
}
}
