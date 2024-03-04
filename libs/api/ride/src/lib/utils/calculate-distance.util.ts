import { Point } from 'geojson';

/**
 * Calculates the distance between two points using the Haversine formula.
 * @param startLocation - The starting point coordinates.
 * @param endLocation - The ending point coordinates.
 * @returns The distance between the two points in kilometers.
 */
export function calculateDistance(
  startLocation: Point,
  endLocation: Point
): number {
  const latitude1 = startLocation.coordinates[1];
  const longitude1 = startLocation.coordinates[0];
  const latitude2 = endLocation.coordinates[1];
  const longitude2 = endLocation.coordinates[0];

  const radLatitude1 = degreesToRadians(latitude1);
  const radLongitude1 = degreesToRadians(longitude1);
  const radLatitude2 = degreesToRadians(latitude2);
  const radLongitude2 = degreesToRadians(longitude2);

  const dLat = radLatitude2 - radLatitude1;
  const dLon = radLongitude2 - radLongitude1;

  // Haversine
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(radLatitude1) *
      Math.cos(radLatitude2) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = 6371 * c;

  const roundedDistance = Math.round(distance * 100) / 100;
  return roundedDistance;
}

/**
 * Converts degrees to radians.
 * @param degrees - The value in degrees to be converted.
 * @returns The value in radians.
 */
export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}
