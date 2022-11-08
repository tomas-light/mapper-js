import { MapKey } from './MapKey';
import { MapFunction } from './MapFunction';
import { MappingProfile } from './MappingProfile';

type SourceKey = MapKey;
type DestinationKey = MapKey;

export class Mapper {
	private static mapFunctions = new Map<SourceKey, Map<DestinationKey, MapFunction>>();

	private static findMapFunction(sourceKey: SourceKey, destinationKey: DestinationKey) {
		const sourceMap = Mapper.mapFunctions.get(sourceKey);
		if (!sourceMap || !sourceMap.has(destinationKey)) {
			return undefined;
		}

		return sourceMap.get(destinationKey);
	}

	static addProfiles(profiles: MappingProfile[]) {
		profiles.forEach((profile: MappingProfile) => Mapper.addProfile(profile));
	}

	static addProfile(profile: MappingProfile) {
		profile.get().forEach((mapFunction: MapFunction) => {
			const addedMapFunction = Mapper.findMapFunction(mapFunction.sourceKey, mapFunction.destinationKey);
			if (addedMapFunction) {
				throw Error(
					`Adding mapping failed: the mapping key already added (sourceType: ${mapFunction.sourceKey}, destinationType: ${mapFunction.destinationKey})`
				);
			}

			let sourceMap = Mapper.mapFunctions.get(mapFunction.sourceKey);
			if (!sourceMap) {
				sourceMap = new Map();
				Mapper.mapFunctions.set(mapFunction.sourceKey, sourceMap);
			}

			sourceMap.set(mapFunction.destinationKey, mapFunction);
		});
	}

	static map<TDestination>(
		sourceType: string,
		destinationType: string,
		sourceModel: any,
		destinationModel?: TDestination
	): TDestination {
		const mapFunction: MapFunction | undefined = Mapper.findMapFunction(sourceType, destinationType);
		if (!mapFunction) {
			throw Error(
				`A mapping for types not registered (sourceType: ${sourceType}, destinationType: ${destinationType})`
			);
		}
		return mapFunction.map(sourceModel, destinationModel);
	}
}
