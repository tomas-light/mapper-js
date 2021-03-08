import { MapKey } from './MapKey';
import { MapFunction } from './MapFunction';
import { MappingProfile } from './MappingProfile';

export class Mapper {
  private static mapFunctions: MapFunction[] = [];

  private static findByKey(key: MapKey) {
    return Mapper.find(key.sourceType, key.destinationType);
  }

  private static find(sourceType: string, destinationType: string) {
    return Mapper.mapFunctions.find(
      (mapFunction: MapFunction) =>
        mapFunction.key.sourceType === sourceType &&
        mapFunction.key.destinationType === destinationType
    );
  }

  static addProfiles(profiles: MappingProfile[]) {
    profiles.forEach((profile: MappingProfile) => Mapper.addProfile(profile));
  }

  static addProfile(profile: MappingProfile) {
    profile.get().forEach((mapFunction: MapFunction) => {
      const addedMapFunction = Mapper.findByKey(mapFunction.key);
      if (addedMapFunction) {
        throw Error(`Adding mapping failed: the mapping key already added (sourceType: ${mapFunction.key.sourceType}, destinationType: ${mapFunction.key.destinationType})`);
      }

      Mapper.mapFunctions.push(mapFunction);
    });
  }

  static map<TDestination>(
    sourceType: string,
    destinationType: string,
    sourceModel: any,
    destinationModel?: TDestination
  ): TDestination {
    const mapFunction: MapFunction | undefined = Mapper.find(sourceType, destinationType);
    if (!mapFunction) {
      throw Error(`A mapping for types not registered (sourceType: ${sourceType}, destinationType: ${destinationType})`);
    }
    return mapFunction.map(sourceModel, destinationModel);
  }
}
