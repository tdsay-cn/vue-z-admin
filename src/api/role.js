import request from '@/utils/request'

export function getRoleList(data = {}) {
  return request({
    url: '/system/role/list',
    method: 'post',
    data
  })
}

export function saveRolePermission(data) {
  return request({
    url: '/system/role/permission',
    method: 'put',
    data
  })
}

export function addRole(data) {
  return request({
    url: '/system/role/add',
    method: 'post',
    data
  })
}

export function deleteRole(id) {
  return request({
    url: '/system/role/' + id,
    method: 'delete'
  })
}

export function getAllRoleList() {
  return request({
    url: '/system/role/all',
    method: 'get'
  })
}
