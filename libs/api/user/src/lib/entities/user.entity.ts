import { BaseEntity } from '@backend/api/common/entities';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Point } from 'geojson';
import { PaymentMethod } from '@ride-spark/payment/entities/payment-method.entity';
@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({
    type: 'enum',
    enum: ['rider', 'driver'],
    default: 'rider',
  })
  type: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  location: Point;

  @Column({ type: 'timestamp', nullable: true })
  last_location_update: Date;

  @OneToMany(() => PaymentMethod, (paymentMethod) => paymentMethod.user)
  paymentMethods: PaymentMethod[];
}
