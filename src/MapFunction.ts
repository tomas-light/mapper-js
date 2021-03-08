import { MapKey } from './MapKey';

export class MapFunction<TResult = any> {
  key: MapKey;
  map: (model: any, destinationModel?: any) => TResult;

  constructor(
    sourceType: string,
    destinationType: string,
    func: (model: any, destinationModel?: any) => TResult
  ) {
    this.key = {
      sourceType,
      destinationType,
    };
    this.map = func;
  }
}
