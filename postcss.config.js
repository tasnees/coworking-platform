module.exports = {
  plugins: {
    'postcss-import': require.resolve('postcss-import'),
    '@tailwindcss/nesting': {},
    'tailwindcss': {},
    'autoprefixer': {},
    'postcss-flexbugs-fixes': {},
    'postcss-preset-env': {
      autoprefixer: {
        flexbox: 'no-2009',
        grid: 'autoplace',
      },
      stage: 3,
      features: {
        'custom-properties': false,
        'nesting-rules': true,
        'custom-media-queries': true,
        'color-mod-function': true,
      },
    },
  },
}
