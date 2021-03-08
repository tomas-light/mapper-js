export class MappingProfileBase {
  protected static autoMap<TSource, TDestination>(
    sourceModel: TSource,
    destinationModel: TDestination
  ): TDestination {

    let keys = Object.keys(destinationModel);
    if (keys.length === 0) {
      keys = Object.keys(sourceModel);
    }

    keys.forEach((propertyName: string) => {
      if (propertyName in sourceModel) {
        destinationModel[propertyName] = sourceModel[propertyName];
      }
    });

    return destinationModel;
  }
}
