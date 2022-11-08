import { MappingProfileBase } from './MappingProfileBase';

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
		prop2: 123,
	};
	const obj2 = {};

	const result = MappingProfileBase.autoMap(obj1, obj2);
	expect(result).toBe(obj2);
	expect(obj2['prop1']).toBe('qqq');
	expect(obj2['prop2']).toBe(123);
});

describe('nested objects', () => {
	const obj1 = {
		prop1: {
			prop11: 'qqq',
			prop12: 123,
		},
		prop2: {
			prop21: 444,
			prop22: '345',
		},
	};
	const obj2: typeof obj1 = {} as any;

	const result = MappingProfileBase.autoMap(obj1, obj2);

	test('mapper doesnt create new object for destination', () => {
		expect(result).toBe(obj2);
	});

	test('nested objects has different refs', () => {
		expect(obj2.prop1).not.toBe(obj1.prop1);
		expect(obj2.prop2).not.toBe(obj1.prop2);
	});

	test('nested objects are fully copied', () => {
		expect(obj2.prop1.prop11).toBe(obj1.prop1.prop11);
		expect(obj2.prop1.prop12).toBe(obj1.prop1.prop12);
		expect(obj2.prop2.prop21).toBe(obj1.prop2.prop21);
		expect(obj2.prop2.prop22).toBe(obj1.prop2.prop22);
	});
});
