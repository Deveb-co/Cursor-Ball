module.exports = {
  plugins: [
    "postcss-preset-env",
    require('precss'),
    require('cssnano')({
      preset: 'default',
      plugins: ['autoprefixer']
    }),
  ]
}