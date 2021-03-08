const config = {
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      astTransformers: {
        before: ['ts-nameof'],
      },
    },
  },
};

module.exports = config;
