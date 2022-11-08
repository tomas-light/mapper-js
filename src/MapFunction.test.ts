import { MapFunction } from './MapFunction';

test('constructor', () => {
	const fn = jest.fn();

	const result = new MapFunction('type 1', 'type 2', fn);

	expect(result.sourceKey).toBe('type 1');
	expect(result.destinationKey).toBe('type 2');
	expect(result.map).toBe(fn);
});
