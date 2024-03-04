/**
 * Interface que define una entidad base con campos comunes y comportamientos para todas las entidades.
 */
export interface IBaseEntity {
  /**
   * Fecha de creación de la entidad.
   * @type {Date}
   */
  createdAt: Date;

  /**
   * Fecha de la última actualización de la entidad.
   * @type {Date}
   */
  updatedAt: Date;

  /**
   * Fecha en la que la entidad fue eliminada (soft delete).
   * @type {Date | null}
   */
  deletedAt: Date | null;
}
