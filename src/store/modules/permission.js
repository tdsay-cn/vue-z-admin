import { asyncRoutes, constantRoutes } from '@/router'

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(permissionList, route) {
  if (route.meta && route.meta.permissionList) {
    return permissionList.some(permission => route.meta.permissionList.includes(permission))
  } else {
    return false
  }
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, permissionList) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(permissionList, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, permissionList)
      }
      res.push(tmp)
    }
  })

  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  generateRoutes({ commit }, data) {
    return new Promise(resolve => {
      let accessedRoutes
      // admin角色不受权限限制
      if (data.roleList.includes('admin') || data.permissionList.includes(-1)) {
        accessedRoutes = asyncRoutes || []
      } else {
        accessedRoutes = filterAsyncRoutes(asyncRoutes, data.permissionList)
      }
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
