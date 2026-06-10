import request from '@/utils/request'

export function getUserList(data) {
  return request({
    url: '/system/user/list',
    method: 'post',
    data
  })
}

export function updateUser(data) {
  return request({
    url: '/system/user',
    method: 'put',
    data
  })
}

export function deleteUser(id) {
  return request({
    url: `/system/user/${id}`,
    method: 'delete'
  })
}

export function updateUserPassword(data) {
  return request({
    url: '/system/user/password',
    method: 'put',
    data
  })
}

export function addUser(data) {
  return request({
    url: '/system/user/add',
    method: 'post',
    data
  })
}

export function saveUserPermission(data) {
  return request({
    url: '/system/user/permission',
    method: 'put',
    data
  })
}

export function updateUserRole(data) {
  return request({
    url: '/system/user/role',
    method: 'put',
    data
  })
}
