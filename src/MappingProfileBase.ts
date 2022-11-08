export class MappingProfileBase {
	static autoMap<TSource extends object, TDestination extends object>(
		sourceModel: TSource,
		destinationModel: TDestination
	): TDestination {
		let keys = Object.keys(destinationModel);
		if (keys.length === 0) {
			keys = Object.keys(sourceModel);
		}

		keys.forEach((propertyName: string) => {
			if (propertyName in sourceModel) {
				if (typeof sourceModel[propertyName] === 'object') {
					destinationModel[propertyName] = MappingProfileBase.autoMap(sourceModel[propertyName], {});
				} else {
					destinationModel[propertyName] = sourceModel[propertyName];
				}
			}
		});

		return destinationModel;
	}
}
