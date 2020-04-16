module.exports = {
  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        args[0].title = 'Sampling Web App'
        return args
      })
  },
  devServer: {
    proxy: 'http://localhost:8086'
  },
  productionSourceMap: false
}