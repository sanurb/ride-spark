import * as crypto from 'crypto';
import { BaseEntity } from '@backend/api/common/entities';
import { User } from '@ride-spark/user';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('payment_methods')
export class PaymentMethod extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.paymentMethods, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'text' })
  private _wompi_token: string;

  @Column({ type: 'integer', default: 0 })
  payment_source_id: number;

  @Column({ type: 'varchar', length: 255, default: 'CARD' })
  type: string;

  @Column({ type: 'boolean', default: false })
  default_method: boolean;

  private encryptToken(token: string): string {
    const iv = Buffer.from(process.env['ENCRYPTION_IV'] || '', 'hex');
    const key = Buffer.from(process.env['ENCRYPTION_KEY'] || '', 'hex');
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  private decryptToken(encryptedToken: string): string {
    const iv = Buffer.from(process.env['ENCRYPTION_IV'] || '', 'hex');
    const key = Buffer.from(process.env['ENCRYPTION_KEY'] || '', 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedToken, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  @BeforeInsert()
  @BeforeUpdate()
  encryptFields() {
    if (this._wompi_token && !this.isEncrypted(this._wompi_token)) {
        this._wompi_token = this.encryptToken(this._wompi_token);
    }
  }

  private isEncrypted(token: string): boolean {
    return token.length > 50;
  }

  set wompi_token(token: string) {
    if (token && !this.isEncrypted(token)) {
      this._wompi_token = this.encryptToken(token);
    } else {
      this._wompi_token = token;
    }
  }

  get wompi_token(): string {
    return this.decryptToken(this._wompi_token);
  }
}
