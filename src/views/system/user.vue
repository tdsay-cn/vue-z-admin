<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>用户管理</span>
        <el-button v-permission="103" style="float: right;" type="primary" @click="handleAdd">新增</el-button>
      </div>
      <el-form :inline="true" :model="queryForm" class="search-form">
        <el-form-item label="ID">
          <el-input v-model="queryForm.id" placeholder="请输入用户ID" clearable />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="queryForm.mobile" placeholder="请输入手机号" clearable />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="queryForm.nickName" placeholder="请输入昵称" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      <el-table
        :data="userList"
        style="width: 100%"
      >
        <el-table-column
          prop="id"
          label="ID"
          width="80"
        />
        <el-table-column
          prop="mobile"
          label="手机号"
          width="130"
        />
        <el-table-column
          prop="username"
          label="用户名"
          width="120"
        />
        <el-table-column
          prop="email"
          label="邮箱"
        />
        <el-table-column
          prop="nickName"
          label="昵称"
          width="120"
        />
        <el-table-column
          label="角色"
          width="200"
        >
          <template slot-scope="scope">
            <el-tag
              v-for="(role, index) in scope.row.roleInfoList"
              :key="index"
              size="mini"
              style="margin-right: 5px; margin-bottom: 5px;"
            >
              {{ role.name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="220"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-button v-permission="105" size="mini" type="primary" icon="el-icon-edit" @click="handleEdit(scope.row)">编辑</el-button>
            <el-dropdown trigger="click" @command="(cmd) => handleAction(cmd, scope.row)">
              <el-button size="mini" icon="el-icon-more">
                操作
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-permission="106" command="editPassword" icon="el-icon-key">修改密码</el-dropdown-item>
                <el-dropdown-item v-permission="109" command="configRole" icon="el-icon-user-solid">配置角色</el-dropdown-item>
                <el-dropdown-item v-permission="108" command="configPermission" icon="el-icon-lock">配置独立权限</el-dropdown-item>
                <el-dropdown-item v-permission="107" command="delete" icon="el-icon-delete" divided style="color: #f56c6c">删除</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        style="margin-top: 20px; text-align: right;"
        :current-page="pagination.currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pagination.pageSize"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        prev-text="上一页"
        next-text="下一页"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 编辑/新增对话框 -->
    <el-dialog
      :title="isEdit ? '编辑用户' : '新增用户'"
      :visible.sync="dialogVisible"
      width="500px"
    >
      <el-form ref="editForm" :model="editForm" :rules="editRules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" placeholder="请输入用户名" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickName">
          <el-input v-model="editForm.nickName" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item v-if="!isEdit" label="密码" prop="password">
          <el-input v-model="editForm.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </span>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog
      title="修改密码"
      :visible.sync="passwordDialogVisible"
      width="500px"
    >
      <el-form ref="passwordForm" :model="passwordForm" :rules="passwordRules" label-width="80px">
        <el-form-item label="新密码" prop="password">
          <el-input v-model="passwordForm.password" type="password" placeholder="请输入新密码" show-password />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSavePassword">保存</el-button>
      </span>
    </el-dialog>

    <!-- 用户独立权限配置对话框 -->
    <el-dialog
      title="用户独立权限配置"
      :visible.sync="permissionDialogVisible"
      width="50%"
      @close="handlePermissionDialogClose"
    >
      <el-tree
        ref="permissionTree"
        :data="permissionTree"
        :props="treeProps"
        show-checkbox
        node-key="id"
        highlight-current
        :default-expanded-keys="defaultExpandedKeys"
      />
      <span slot="footer" class="dialog-footer">
        <el-button @click="permissionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveUserPermission">保存</el-button>
      </span>
    </el-dialog>

    <!-- 用户角色配置对话框 -->
    <el-dialog
      title="用户角色配置"
      :visible.sync="roleDialogVisible"
      width="500px"
    >
      <el-form label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="currentUserInfo.username" disabled />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="currentUserInfo.nickName" disabled />
        </el-form-item>
        <el-form-item label="角色">
          <el-select
            v-model="roleForm.roleIdSet"
            multiple
            filterable
            remote
            reserve-keyword
            placeholder="请输入角色名称搜索"
            :remote-method="remoteSearchRole"
            :loading="roleSearchLoading"
            style="width: 100%;"
          >
            <el-option
              v-for="role in filteredRoleList"
              :key="role.id"
              :label="role.name"
              :value="role.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveUserRole">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getUserList, updateUser, deleteUser, updateUserPassword, addUser, saveUserPermission, updateUserRole } from '@/api/user'
import { getUserPermissionTree } from '@/api/permission'
import { getRoleList, getAllRoleList } from '@/api/role'

export default {
  name: 'UserManage',
  data() {
    return {
      userList: [],
      queryForm: {
        id: '',
        mobile: '',
        nickName: ''
      },
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      dialogVisible: false,
      isEdit: false,
      editForm: {
        id: '',
        username: '',
        mobile: '',
        email: '',
        nickName: '',
        password: ''
      },
      roleList: [],
      passwordDialogVisible: false,
      passwordForm: {
        id: '',
        password: ''
      },
      permissionDialogVisible: false,
      currentUserId: null,
      permissionTree: [],
      checkedPermissionIds: [],
      defaultExpandedKeys: [],
      currentRolePermissionIdSet: new Set(),
      currentUserPermissionIdList: [],
      treeProps: {
        children: 'children',
        label: 'name',
        disabled: 'disabled'
      },
      roleDialogVisible: false,
      roleForm: {
        userId: null,
        roleIdSet: []
      },
      currentUserInfo: {
        username: '',
        nickName: ''
      },
      allRoleList: [],
      filteredRoleList: [],
      roleSearchLoading: false,
      editRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
        ],
        nickName: [
          { required: true, message: '请输入昵称', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ]
      },
      passwordRules: {
        password: [
          { required: true, message: '请输入新密码', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.loadUserList()
  },
  methods: {
    async loadUserList() {
      try {
        const params = {
          currentPage: this.pagination.currentPage,
          pageSize: this.pagination.pageSize
        }
        if (this.queryForm.id) {
          params.id = this.queryForm.id
        }
        if (this.queryForm.mobile) {
          params.mobile = this.queryForm.mobile
        }
        if (this.queryForm.nickName) {
          params.nickName = this.queryForm.nickName
        }
        const response = await getUserList(params)
        this.userList = response.data?.records || []
        this.pagination.total = response.data?.total || 0
      } catch (error) {
        this.$message.error('加载用户列表失败')
      }
    },
    handleQuery() {
      this.pagination.currentPage = 1
      this.loadUserList()
    },
    handleReset() {
      this.queryForm = {
        id: '',
        mobile: '',
        nickName: ''
      }
      this.pagination.currentPage = 1
      this.loadUserList()
    },
    handleSizeChange(val) {
      this.pagination.pageSize = val
      this.loadUserList()
    },
    handleCurrentChange(val) {
      this.pagination.currentPage = val
      this.loadUserList()
    },
    async loadRoleList() {
      try {
        const response = await getRoleList()
        this.roleList = response.data?.records || []
      } catch (error) {
        this.$message.error('加载角色列表失败')
      }
    },
    async handleAdd() {
      this.isEdit = false
      this.editForm = {
        id: '',
        username: '',
        mobile: '',
        email: '',
        nickName: '',
        password: ''
      }
      this.dialogVisible = true
    },
    async handleEdit(row) {
      this.isEdit = true
      this.editForm = {
        id: row.id,
        username: row.username,
        mobile: row.mobile,
        email: row.email,
        nickName: row.nickName,
        password: ''
      }
      this.dialogVisible = true
    },
    async handleSave() {
      try {
        await this.$refs.editForm.validate()
        if (this.isEdit) {
          await updateUser(this.editForm)
        } else {
          await addUser(this.editForm)
        }
        this.$message.success('保存成功')
        this.dialogVisible = false
        this.loadUserList()
      } catch (error) {
        if (error !== false) {
          this.$message.error('保存失败')
        }
      }
    },
    handleAction(cmd, row) {
      switch (cmd) {
        case 'editPassword':
          this.handleEditPassword(row)
          break
        case 'configRole':
          this.handleConfigRole(row)
          break
        case 'configPermission':
          this.handleConfigPermission(row)
          break
        case 'delete':
          this.handleDelete(row)
          break
      }
    },
    handleEditPassword(row) {
      this.passwordForm = {
        id: row.id,
        password: ''
      }
      this.passwordDialogVisible = true
    },
    async handleSavePassword() {
      try {
        await this.$refs.passwordForm.validate()
        await updateUserPassword(this.passwordForm)
        this.$message.success('密码修改成功')
        this.passwordDialogVisible = false
      } catch (error) {
        if (error !== false) {
          this.$message.error('密码修改失败')
        }
      }
    },
    async handleDelete(row) {
      try {
        await this.$confirm(`确定删除用户: ${row.nickName}?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await deleteUser(row.id)
        this.$message.success('删除成功')
        this.loadUserList()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除失败')
        } else {
          this.$message.info('已取消删除')
        }
      }
    },
    async handleConfigPermission(row) {
      this.currentUserId = row.id
      this.permissionDialogVisible = true
      await this.loadUserPermissionTree()
    },
    async loadUserPermissionTree() {
      try {
        const response = await getUserPermissionTree(this.currentUserId)
        const data = response.data
        this.currentRolePermissionIdSet = new Set(data.currentRolePermissionIdSet || [])
        this.currentUserPermissionIdList = data.currentUserPermissionIdList || data.currenUserPermissionIdList || []
        this.permissionTree = this.markDisabledNodes(data.permissionTree || [])
        this.checkedPermissionIds = [
          ...this.currentRolePermissionIdSet,
          ...this.currentUserPermissionIdList
        ]
        this.defaultExpandedKeys = this.getFirstThreeLevelIds(this.permissionTree)

        this.$nextTick(() => {
          if (this.$refs.permissionTree) {
            const leafIds = this.getLeafPermissionIds(this.checkedPermissionIds)
            this.$refs.permissionTree.setCheckedKeys(leafIds)
          }
        })
      } catch (error) {
        this.$message.error('获取权限树失败')
      }
    },
    markDisabledNodes(treeData) {
      const markNodes = (nodes) => {
        return nodes.map(node => {
          const newNode = { ...node }
          if (this.currentRolePermissionIdSet.has(node.id)) {
            newNode.disabled = true
          }
          if (node.children && node.children.length > 0) {
            newNode.children = markNodes(node.children)
          }
          return newNode
        })
      }
      return markNodes(treeData)
    },
    getFirstThreeLevelIds(treeData) {
      const ids = []
      const collectIds = (nodes, level = 1) => {
        nodes.forEach(node => {
          if (level <= 3) {
            ids.push(node.id)
          }
          if (node.children && node.children.length > 0 && level < 3) {
            collectIds(node.children, level + 1)
          }
        })
      }
      collectIds(treeData)
      return ids
    },
    getLeafPermissionIds(permissionIds) {
      const leafIds = []
      const isLeafNode = (nodes, targetId) => {
        for (const node of nodes) {
          if (node.id === targetId) {
            return !node.children || node.children.length === 0
          }
          if (node.children && node.children.length > 0) {
            const found = isLeafNode(node.children, targetId)
            if (found !== null) return found
          }
        }
        return null
      }
      permissionIds.forEach(id => {
        if (isLeafNode(this.permissionTree, id)) {
          leafIds.push(id)
        }
      })
      return leafIds
    },
    async handleSaveUserPermission() {
      try {
        const checkedKeys = this.$refs.permissionTree.getCheckedKeys()
        const halfCheckedKeys = this.$refs.permissionTree.getHalfCheckedKeys()
        const allPermissionIds = [...checkedKeys, ...halfCheckedKeys]
        const userPermissionIds = allPermissionIds.filter(id => !this.currentRolePermissionIdSet.has(id))
        await saveUserPermission({
          userId: this.currentUserId,
          permissionSet: userPermissionIds
        })
        this.$message.success('权限保存成功')
        this.permissionDialogVisible = false
      } catch (error) {
        this.$message.error('权限保存失败')
      }
    },
    handlePermissionDialogClose() {
      this.permissionTree = []
      this.checkedPermissionIds = []
      this.defaultExpandedKeys = []
      this.currentRolePermissionIdSet = new Set()
      this.currentUserPermissionIdList = []
      this.currentUserId = null
    },
    async handleConfigRole(row) {
      this.roleForm = {
        userId: row.id,
        roleIdSet: row.roleInfoList ? row.roleInfoList.map(role => role.id) : []
      }
      this.currentUserInfo = {
        username: row.username,
        nickName: row.nickName
      }
      await this.loadAllRoleList()
      this.roleDialogVisible = true
    },
    async loadAllRoleList() {
      try {
        const response = await getAllRoleList()
        this.allRoleList = response.data || []
        this.filteredRoleList = response.data || []
      } catch (error) {
        this.$message.error('加载角色列表失败')
      }
    },
    remoteSearchRole(query) {
      if (query) {
        this.roleSearchLoading = true
        setTimeout(() => {
          this.filteredRoleList = this.allRoleList.filter(role =>
            role.name.toLowerCase().includes(query.toLowerCase())
          )
          this.roleSearchLoading = false
        }, 200)
      } else {
        this.filteredRoleList = this.allRoleList
      }
    },
    async handleSaveUserRole() {
      try {
        await updateUserRole({
          userId: this.roleForm.userId,
          roleIdSet: this.roleForm.roleIdSet
        })
        this.$message.success('角色保存成功')
        this.roleDialogVisible = false
        this.loadUserList()
      } catch (error) {
        this.$message.error('角色保存失败')
      }
    }
  }
}
</script>

<style scoped>
.box-card {
  margin-bottom: 20px;
}
.search-form {
  margin-bottom: 20px;
}
</style>
