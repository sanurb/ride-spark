import { BaseEntity } from '@backend/api/common/entities';
import { Ride } from '@ride-spark/ride';
import { User } from '@ride-spark/user';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('transactions')
export class Transaction extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Ride, ride => ride.id)
  @JoinColumn({ name: 'ride_id' })
  ride_id: number;

  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: 'passenger_id' })
  user_id: number; //  Passenger

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: ['successful', 'failed'], default: 'successful' })
  status: string;

  @Column({ type: 'varchar', length: 255 })
  wompi_transaction_id: string;
}
