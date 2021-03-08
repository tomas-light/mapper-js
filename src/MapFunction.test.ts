import { MapFunction } from './MapFunction';

test('constructor', () => {
  const fn = jest.fn();

  const result = new MapFunction(
    'type 1',
    'type 2',
    fn
  );

  expect(result.key).not.toBe(undefined);
  expect(result.key.sourceType).toBe('type 1');
  expect(result.key.destinationType).toBe('type 2');
  expect(result.map).toBe(fn);
});
