import { IBaseEntity } from '@shared/api-interfaces';
import { CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Defines a base entity with common fields and behaviors for all entities.
 * @abstract
 */
export abstract class BaseEntity implements IBaseEntity{
  /** @member {Date} createdAt - the create date */
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  /** @member {Date} updatedAt - the update date */
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  /** @member {Date} deletedAt - the delete date */
  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp',
    nullable: true,
    default: null,
  })
  deletedAt: Date;
}
