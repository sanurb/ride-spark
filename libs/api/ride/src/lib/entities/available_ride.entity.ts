import { BaseEntity } from '@backend/api/common/entities';
import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { Ride } from './ride.entity';
import { Point } from 'geojson';

@Entity('available_rides')
export class AvailableRide extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => Ride)
  @JoinColumn({ name: 'ride_id' })
  ride_id: number;

  @Column({ type: 'timestamp' })
  request_time: Date;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  start_location: Point;
}
