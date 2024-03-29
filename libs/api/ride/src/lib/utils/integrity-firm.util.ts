import { ConfigService } from "@nestjs/config";
import crypto from 'crypto';
import { config } from "dotenv";

config();

const configService = new ConfigService();

/**
 * Creates an integrity firm string by combining the reference, amount, and secret key.
 * Then, it calculates the SHA-256 hash of the integrity firm string and returns it as a hexadecimal string.
 * @param reference - The reference string.
 * @param amount - The amount as a positive number.
 * @returns A Promise that resolves to the SHA-256 hash of the integrity firm string.
 * @throws If the reference is not a non-empty string or the amount is not a positive number, an error is thrown.
 * @throws If the secret key is not available, an error is thrown.
 */
export const createIntegrityFirm = async (reference: string, amount: number, currency = 'COP'): Promise<string> => {
  try {
    if (typeof reference !== 'string') {
      throw new Error('Reference must be a non-empty string.')
    }
    if (isNaN(amount) || amount <= 0) {
      throw new Error('Amount must be a positive number.')
    }
    const secretKey = configService.getOrThrow<string>('INTEGRITY_FIRM')
    if (typeof secretKey !== 'string') {
      throw new Error('Secret key is not available.')
    }
    const integrityFirm = `${reference}${amount}${currency}${secretKey}`
    const enCodeText = new TextEncoder().encode(integrityFirm)
    const hashBuffer = await crypto.subtle.digest('SHA-256', enCodeText)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    return hashHex
  } catch (error) {
    if (error instanceof Error) {
      return `${error.message}`
    }
    return ''
  }
}
