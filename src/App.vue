<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<style lang="stylus">
body
  margin: 0

#app
  font-family: Avenir, Helvetica, Arial, sans-serif
  -webkit-font-smoothing: antialiased
  -moz-osx-font-smoothing: grayscale
  color: #2c3e50

textarea
  font-family: Arial, Helvetica, sans-serif

.bigicon
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.2)
.bigicon [class^="el-third-icon"]
  font-size: 25px

.bottom-function-btn
  .bigicon [class^="el-third-icon"], .el-icon-loading
    font-size: 25px
</style>
