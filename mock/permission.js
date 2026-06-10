const permissionTree = [
  {
    id: 1,
    name: '系统管理',
    children: [
      {
        id: 11,
        name: '用户管理',
        children: [
          { id: 111, name: '用户查询' },
          { id: 112, name: '用户创建' },
          { id: 113, name: '用户编辑' },
          { id: 114, name: '用户删除' }
        ]
      },
      {
        id: 12,
        name: '权限配置',
        children: [
          { id: 121, name: '权限查询' },
          { id: 122, name: '权限配置' }
        ]
      }
    ]
  },
  {
    id: 2,
    name: '内容管理',
    children: [
      {
        id: 21,
        name: '文章管理',
        children: [
          { id: 211, name: '文章查询' },
          { id: 212, name: '文章创建' },
          { id: 213, name: '文章编辑' },
          { id: 214, name: '文章删除' }
        ]
      },
      {
        id: 22,
        name: '分类管理',
        children: [
          { id: 221, name: '分类查询' },
          { id: 222, name: '分类管理' }
        ]
      }
    ]
  },
  {
    id: 3,
    name: '数据统计',
    children: [
      { id: 31, name: '访问统计' },
      { id: 32, name: '用户行为分析' }
    ]
  }
]

const roleList = [
  { id: 1, roleName: '超级管理员', description: '拥有系统所有权限' },
  { id: 2, roleName: '编辑', description: '可以管理内容相关操作' },
  { id: 3, roleName: '查看者', description: '只有查看权限' }
]

const rolePermissions = {
  1: [1, 11, 111, 112, 113, 114, 12, 121, 122, 2, 21, 211, 212, 213, 214, 22, 221, 222, 3, 31, 32],
  2: [2, 21, 211, 212, 213, 214, 22, 221, 222],
  3: [1, 11, 111, 12, 121, 2, 21, 211, 22, 221, 3, 31, 32]
}

module.exports = [
  {
    url: '/system/role/list',
    type: 'get',
    response: _ => {
      return {
        code: 0,
        data: roleList
      }
    }
  },
  {
    url: '/system/permission/tree',
    type: 'get',
    response: config => {
      const roleId = parseInt(config.query.roleId)
      return {
        code: 0,
        data: {
          currentRolePermissionIdList: rolePermissions[roleId] || [],
          permissionTreeSubVoList: permissionTree
        }
      }
    }
  },
  {
    url: '/permission/tree',
    type: 'get',
    response: _ => {
      return {
        code: 0,
        data: permissionTree
      }
    }
  },
  {
    url: '/permission/role-permissions/.*',
    type: 'get',
    response: config => {
      const roleId = parseInt(config.url.split('/').pop())
      return {
        code: 0,
        data: rolePermissions[roleId] || []
      }
    }
  },
  {
    url: '/permission/update-role-permissions',
    type: 'post',
    response: config => {
      const { roleId, permissionIds } = config.body
      rolePermissions[roleId] = permissionIds
      return {
        code: 0,
        data: 'success'
      }
    }
  }
]
