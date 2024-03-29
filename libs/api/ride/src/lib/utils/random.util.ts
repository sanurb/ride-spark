/**
 * Generates a random code based on the specified length and type.
 * @param longitud The length of the random code.
 * @param tipo The type of the random code. Can be 'uuid', 'postalCode', or 'alfanumérico' (optional).
 * @returns The generated random code.
 */
export const generateRandomCode = (longitud: number, tipo?: 'uuid' | 'postalCode' | 'alfanumérico'): string => {
  let caracteresValidos = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_'

  if (tipo === 'alfanumérico') {
    caracteresValidos += '.'
  }

  let referencia = ''
  for (let i = 0; i < longitud; i++) {
    referencia += caracteresValidos[Math.floor(Math.random() * caracteresValidos.length)]
  }

  if (tipo === 'uuid') {
    referencia = referencia.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5')
  } else if (tipo === 'postalCode') {
    referencia = referencia.replace(/(.{3})(.{3})/, '$1-$2')
  }

  return referencia
}
