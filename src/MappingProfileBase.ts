export class MappingProfileBase {
	static autoMap<Source extends object, Destination extends object = Source>(
		sourceModel: Source,
		destinationModel: Destination
	): Destination {
		if (typeof sourceModel !== 'object') {
			return sourceModel;
		}

		if (sourceModel === null) {
			return null as any;
		}

		if (Array.isArray(sourceModel)) {
			return sourceModel.map((element) => MappingProfileBase.autoMap(element, {})) as Destination;
		}

		let keys = Object.keys(destinationModel);
		if (keys.length === 0) {
			keys = Object.keys(sourceModel);
		}

		keys.forEach((propertyName) => {
			if (propertyName in sourceModel) {
				if (typeof sourceModel[propertyName] === 'object') {
					destinationModel[propertyName] = MappingProfileBase.autoMap(
						sourceModel[propertyName],
						destinationModel[propertyName] ?? {}
					);
				} else {
					destinationModel[propertyName] = sourceModel[propertyName];
				}
			}
		});

		return destinationModel;
	}
}
