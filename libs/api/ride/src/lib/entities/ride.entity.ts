import { BaseEntity } from '@backend/api/common/entities';
import { User } from '@ride-spark/user';
import { Point } from 'geojson';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('rides')
export class Ride extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: 'passenger_id' })
  passenger_id: number;

  @ManyToOne(() => User, user => user.id, { nullable: true })
  @JoinColumn({ name: 'driver_id' })
  driver_id: number | null;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  start_location: Point;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  end_location: Point | null;

  @Column({ type: 'timestamp', nullable: true })
  start_time: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  end_time: Date | null;

  @Column({ type: 'enum', enum: ['waiting', 'in_progress', 'finished'], default: 'waiting' })
  status: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, default: 0})
  total_charged: number | null;
}
