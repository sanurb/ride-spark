import { DatabaseErrorCode } from "../enums";

export const DatabaseErrorMessageMap: Record<DatabaseErrorCode, string> = {
  [DatabaseErrorCode.UNIQUE_VIOLATION]: 'Violación de unicidad: El dato ya existe.',
};
