import { MapFunctionKey } from './types';

export class MapFunction<Source extends object = any, Destination extends object = any> {
  constructor(
    public sourceKey: MapFunctionKey<Source>,
    public destinationKey: MapFunctionKey<Destination>,
    public map: (source: Source) => Destination
  ) {}
}

export class Mapper {
  constructor() {
    Mapper.lastCreatedInstance = this;
    this.mapFunctions = new Map();
  }

  // we can have several isolated mapper instances (for example in tests or in different React Contexts)
  private static lastCreatedInstance: Mapper;

  private static getOrCreateInstance() {
    if (Mapper.lastCreatedInstance) {
      return Mapper.lastCreatedInstance;
    }

    return new Mapper();
  }

  readonly mapFunctions: Map<MapFunctionKey, Map<MapFunctionKey, MapFunction>>;

  static map: Mapper['map'] = (() => {
    return (...args) => {
      const mapper = Mapper.getOrCreateInstance();
      return mapper.map(...args);
    };
  })();

  map<Source extends object, Destination extends object>(
    sourceType: MapFunctionKey<Source>,
    destinationType: MapFunctionKey<Destination>,
    sourceModel: Source
  ): Destination {
    const mapFunction = this.findMapFunction(sourceType, destinationType) as
      | MapFunction<Source, Destination>
      | undefined;

    if (!mapFunction) {
      throw Error(
        `A mapping for types not registered (sourceType: ${sourceType.toString()}, destinationType: ${destinationType.toString()})`
      );
    }

    return mapFunction.map(sourceModel);
  }

  static addMapFunctions: Mapper['addMapFunctions'] = (() => {
    return (...args) => {
      const mapper = Mapper.getOrCreateInstance();
      return mapper.addMapFunctions(...args);
    };
  })();

  addMapFunctions(...mapFunctions: MapFunction[]) {
    mapFunctions.forEach((mapFunction) => {
      const addedMapFunction = this.findMapFunction(mapFunction.sourceKey, mapFunction.destinationKey);
      if (addedMapFunction) {
        throw Error(
          `Adding mapping failed: the mapping key already added (sourceType: ${mapFunction.sourceKey.toString()}, destinationType: ${mapFunction.destinationKey.toString()})`
        );
      }

      let sourceMap = this.mapFunctions.get(mapFunction.sourceKey);
      if (!sourceMap) {
        sourceMap = new Map();
        this.mapFunctions.set(mapFunction.sourceKey, sourceMap);
      }

      sourceMap.set(mapFunction.destinationKey, mapFunction);
    });
  }

  private findMapFunction(sourceKey: MapFunctionKey, destinationKey: MapFunctionKey) {
    const sourceMap = this.mapFunctions.get(sourceKey);
    if (!sourceMap || !sourceMap.has(destinationKey)) {
      return undefined;
    }

    return sourceMap.get(destinationKey);
  }
}
