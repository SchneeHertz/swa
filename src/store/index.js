import Vue from 'vue'
import Vuex from 'vuex'
import _ from 'lodash'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    username: 'test',
    authority: 'test',
    konvaGroupList: [],
    valueList: [],
    shapeList: [],
    konvaRelation: [],
    caseNumber: undefined,
    caseTestitemList: [],
    existCaseInfo: {},
    methodBaseData: {}
  },
  mutations: {
    updateValue (state, payload) {
      if (_.has(payload, 'key') && _.has(payload, 'value')) {
        _.set(state, payload.key, payload.value)
      }
    }
  },
  actions: {
  },
  modules: {
  }
})