# mapper-js
Auto mapper for you models like AutoMapper in .Net

## Installation
npm
```cmd
npm install @tomas-light/mapper-js
```
yarn
```cmd
yarn add @tomas-light/mapper-js
```

## How to use

You may defined your DTOs contracts as abstract classes and map them to your classes. It allows you use ref on class as unique key, and use such class only as a type
```ts
import { Mapper } from '@tomas-light/mapper-js';

abstract class UserDto {
  abstract date: string;
}
class User {
  date: Date;
}

Mapper.addMapFunctions(
  new MapFunction(UserDto, User, (dto) => {
    const user = new User();
    user.date = new Date(dto.date);
    return user;
  })
);

const userDto: UserDto = {
  date: '2023-02-15T13:20:48.794Z',
};

const mappedObj = Mapper.map(UserDto, User, userDto);
mappedObj.date.toISOString(); // same as userDto.date
```

If you can't use abstract classes for DTOs (for example you use type generation for GraphQL scheme), you may use symbols as key for your mapping functions

```ts
import { Mapper } from '@tomas-light/mapper-js';

const userDtoSymbol = Symbol('user dto');
const userInterfaceSymbol = Symbol('user interface');

const userDto = {
  date: '2023-02-15T13:20:48.794Z',
};

interface IUser {
  date: Date;
};

Mapper.addMapFunctions(
  new MapFunction<typeof userDto, IUser>(userDtoSymbol, userInterfaceSymbol, (dto) => ({
    date: new Date(dto.date),
  }))
);

const mappedObj = Mapper.map<typeof userDto, IUser>(userDtoSymbol, userInterfaceSymbol, dto);
mappedObj.date.toISOString(); // same as dto.date
```

### Auto mapping

Here we have utility function to reduce boilerplate in your Map functions called `autoMap`.


You can find more examples in `mapper-js/src/Mapper.test.ts`
