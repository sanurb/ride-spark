import { BaseEntity } from '@backend/api/common/entities';
import { User } from '@ride-spark/user';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('payment_methods')
export class PaymentMethod extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, user => user.paymentMethods, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 255 })
  wompi_token: string;

  @Column({ type: 'integer', default: 0 })
  payment_source_id: number;

  @Column({ type: 'varchar', length: 255, default: 'CARD'})
  type: string;

  @Column({ type: 'boolean', default: false })
  default_method: boolean;
}
