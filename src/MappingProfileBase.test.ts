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

  const result = MappingProfileBase['autoMap'](obj1, obj2);
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
  const obj2 = {
  };

  const result = MappingProfileBase['autoMap'](obj1, obj2);
  expect(result).toBe(obj2);
  expect(obj2['prop1']).toBe('qqq');
  expect(obj2['prop2']).toBe(123);
});
