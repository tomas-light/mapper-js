import { MappingProfileBase } from './MappingProfileBase';

test('if it is a new object', () => {
	const source = { some: 'qqq' };
	const destination = MappingProfileBase.autoMap(source, {} as typeof source);
	expect(destination).not.toBe(source);
});

describe('if primitive properties are mapped', () => {
	const symbol = Symbol('any custom symbol');
	const source = {
		stringProperty: 'qqq',
		numberProperty: 123,
		booleanProperty: true,
		undefinedProperty: undefined,
		symbolProperty: symbol,
	};
	const destination = MappingProfileBase.autoMap(source, {} as typeof source);

	test('string property is mapped', () => {
		expect(destination.stringProperty).toBe('qqq');
	});
	test('number property is mapped', () => {
		expect(destination.numberProperty).toBe(123);
	});
	test('boolean property is mapped', () => {
		expect(destination.booleanProperty).toBe(true);
	});
	test('undefined property is mapped', () => {
		expect('undefinedProperty' in destination).toBeTruthy();
		expect(destination.undefinedProperty).toBe(undefined);
	});
	test('symbol property is mapped', () => {
		expect(destination.symbolProperty).toBe(symbol);
	});
});

describe('if object properties are mapped', () => {
	const array = ['item 1', 'item 2', 'item 3'];
	const source = {
		nullProperty: null,
		arrayProperty: array,
	};
	const destination = MappingProfileBase.autoMap(source, {} as typeof source);

	test('null property is mapped', () => {
		expect(destination.nullProperty).toBe(null);
	});
	test('array property is mapped', () => {
		expect(destination.arrayProperty).toEqual(['item 1', 'item 2', 'item 3']);
	});
	test('array property is mapped to new array', () => {
		expect(destination.arrayProperty).not.toBe(array);
	});

	describe('nested objects', () => {
		const source = {
			some: {
				stringProperty: 'qqq',
			},
			another: {
				numberProperty: 444,
			},
		};

		const destination = MappingProfileBase.autoMap(source, {} as typeof source);

		test('nested objects has different refs', () => {
			expect(destination.some).not.toBe(source.some);
			expect(destination.another).not.toBe(source.another);
		});

		test('nested objects are fully copied', () => {
			expect(destination.some.stringProperty).toBe(source.some.stringProperty);
			expect(destination.another.numberProperty).toBe(source.another.numberProperty);
		});
	});
});

test('filled destination', () => {
	const obj1 = {
		prop1: 'qqq',
		prop2: 123,
	};
	const obj2 = {
		prop2: 444,
		prop3: '345',
	};

	const result = MappingProfileBase.autoMap(obj1, obj2);
	expect(result).toBe(obj2);
	expect(obj2['prop1']).toBe(undefined);
	expect(obj2.prop2).toBe(123);
	expect(obj2.prop3).toBe('345');
});

test('empty destination', () => {
	const obj1 = {
		prop1: 'qqq',
	};
	const obj2 = {};

	const result = MappingProfileBase.autoMap(obj1, obj2);
	expect(result).toBe(obj2);
	expect(obj2['prop1']).toBe('qqq');
});
