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
    // proxy: 'http://10.205.169.70'
  },
  productionSourceMap: false
}