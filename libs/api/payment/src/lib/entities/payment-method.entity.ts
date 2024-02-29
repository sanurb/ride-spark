import { BaseEntity } from '@backend/api/common/entities';
import { User } from '@ride-spark/user';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity('payment_methods')
export class PaymentMethod extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, user => user.id)
  user_id: number;

  @Column({ type: 'varchar', length: 255 })
  wompi_token: string;

  @Column({ type: 'boolean', default: false })
  default_method: boolean;
}
