import request from '@/utils/request'

export function getRolePermissionTree(roleId) {
  return request({
    url: '/system/permission/role/tree',
    method: 'get',
    params: { roleId }
  })
}

export function getUserPermissionTree(userId) {
  return request({
    url: '/system/permission/user/tree',
    method: 'get',
    params: { userId }
  })
}
