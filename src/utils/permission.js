import store from '@/store'

/**
 * 检查用户是否有权限
 * @param {Array|Number|String} permission - 权限值，可以是单个权限或权限数组
 * @returns {Boolean}
 */
export function hasPermission(permission) {
  const permissionList = store.getters.permissionList
  // 如果有-1权限，表示拥有所有权限
  if (permissionList.includes(-1)) {
    return true
  }
  if (Array.isArray(permission)) {
    return permission.some(p => permissionList.includes(p))
  }
  return permissionList.includes(permission)
}

export default hasPermission
