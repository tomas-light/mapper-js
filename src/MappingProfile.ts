import { MapFunction } from './MapFunction';

export interface MappingProfile {
  get: () => MapFunction[];
}
