import { MapKey } from './MapKey';

export class MapFunction<TResult = any> {
	constructor(
		public sourceKey: MapKey,
		public destinationKey: MapKey,
		public map: (model: any, destinationModel?: any) => TResult
	) {}
}
