module.exports = {
  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        args[0].title = 'Sampling Web App'
        return args
      })
  },
  productionSourceMap: false
}