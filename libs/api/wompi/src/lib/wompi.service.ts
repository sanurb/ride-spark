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

  /**
   * Adds a new card to the Wompi payment system.
   * This method sends a request to Wompi to tokenize a credit card. The tokenized card can then be used to make transactions.
   *
   * @remarks
   * This method is typically used to add a new payment method for a user.
   * The body must contain the credit card details including number, CVC, expiration month and year, and card holder's name.
   *
   * @returns A promise resolved with the tokenized card details on success.
   * @throws Will throw an error if the HTTP request fails, which could be due to invalid card details or network issues.
   *
   * @example
   * ```typescript
   * const tokenizedCard = await wompiService.addCard();
   * console.log(tokenizedCard);
   * ```
   */
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

  /**
   * Retrieves merchant details from the Wompi platform.
   * This method is used to fetch details about the merchant associated with the provided public API key.
   *
   * @remarks
   * The merchant information includes details such as the merchant's name, legal name, contact name, and other relevant information.
   *
   * @returns A promise resolved with the merchant details on success.
   * @throws Will throw an error if the HTTP request fails, including scenarios such as unauthorized access (invalid API key).
   *
   * @example
   * ```typescript
   * const merchantDetails = await wompiService.merchant();
   * console.log(merchantDetails);
   * ```
   */
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

  /**
   * Creates a new payment source in Wompi for a customer.
   * This method sends a request to Wompi to create a new payment source which can be a bank account, card, etc.
   *
   * @remarks
   * The payment source creation is necessary for making transactions without providing payment details each time.
   * The method requires token type, token, customer email, and acceptance token.
   *
   * @param tokenType - The type of the token (e.g., 'CARD').
   * @param token - The token representing the payment method, typically obtained from tokenizing a card.
   * @param customerEmail - The email address of the customer.
   * @param acceptanceToken - A token indicating the customer's acceptance of the payment source.
   * @returns A promise resolved with the newly created payment source details on success.
   * @throws Will throw an error if the HTTP request fails, which could be due to invalid input data or network issues.
   *
   * @example
   * ```typescript
   * const paymentSource = await wompiService.paymentSources('CARD', token, 'customer@example.com', acceptanceToken);
   * console.log(paymentSource);
   * ```
   */
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

  /**
   * Charges a specified amount from a customer using a saved payment source.
   * This method creates a new transaction in Wompi to charge the specified amount using the given payment source.
   *
   * @remarks
   * This is typically used for processing a payment from a user. The method requires the amount, customer email, reference, and payment source ID.
   * The currency is set to 'COP' but can be adjusted based on your requirements.
   *
   * @param amount - The amount to be charged, in cents.
   * @param email - The email address of the customer being charged.
   * @param reference - A unique reference for the transaction, for tracking purposes.
   * @param paymentSourceId - The ID of the payment source to be charged.
   * @returns A promise resolved with the charge transaction details on success.
   * @throws Will throw an error if the HTTP request fails, which could be due to invalid input data, unauthorized access, or network issues.
   *
   * @example
   * ```typescript
   * const chargeResponse = await wompiService.charge(5000, 'customer@example.com', 'unique_reference_123', 'payment_source_id');
   * console.log(chargeResponse);
   * ```
   */
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

  /**
   * Retrieves the details of a specific Wompi transaction.
   *
   * This method calls the Wompi API to fetch the details of a transaction identified by its unique transaction ID.
   * It is a direct way to retrieve transaction information, as an alternative to using webhooks.
   * While webhooks can provide real-time updates for transaction events, this endpoint can be used for on-demand transaction status checks.
   *
   * @remarks
   * The transaction ID is a unique identifier assigned by Wompi to each transaction. This method requires
   * the transaction ID to fetch the corresponding transaction details from Wompi.
   *
   * According to Wompi's documentation, it's also possible to handle transaction events using webhooks.
   * For more information on implementing webhooks, refer to the Wompi documentation:
   * https://docs.wompi.co/en/docs/colombia/eventos/
   *
   * @param transactionId - The unique identifier of the transaction to retrieve.
   * @returns A promise resolved with the transaction details or rejected with an error.
   * The transaction details include information such as the amount, reference, status, and the associated payment method.
   *
   * @see {@link IGetTransactionResponse} for the structure of the returned transaction details.
   * @throws Will throw an error if the HTTP request fails, including scenarios such as network issues,
   * invalid transaction IDs, or unauthorized access.
   *
   * @example
   * ```typescript
   * const transactionId = 'txn_123';
   * const transactionDetails = await wompiService.getTransaction(transactionId);
   * console.log(transactionDetails);
   * ```
   */
  async getTransaction(
    transactionId: string
  ): Promise<IGetTransactionResponse> {
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

  /**
   * Handles HTTP errors returned from the Wompi API.
   * If the error response has a status code of 422, it formats and logs the Wompi API validation errors.
   * For other error responses, it logs the HTTP error message.
   * @param error - The error object returned from the HTTP request.
   * @returns An Observable that emits an Error object with the formatted error message.
   */
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
