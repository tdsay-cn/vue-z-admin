<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>角色管理</span>
        <el-button v-permission="154" style="float: right;" type="primary" @click="handleAdd">新增</el-button>
      </div>
      <el-table
        :data="roleList"
        style="width: 100%"
      >
        <el-table-column
          prop="id"
          label="ID"
          width="80"
        />
        <el-table-column
          prop="name"
          label="角色名称"
          width="180"
        />
        <el-table-column
          prop="description"
          label="描述"
        />
        <el-table-column
          label="操作"
          width="180"
        >
          <template slot-scope="scope">
            <el-button v-permission="153" size="mini" type="primary" @click="handleEdit(scope.row)">编辑权限</el-button>
            <el-button v-permission="155" size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
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
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <el-dialog
      title="角色权限配置"
      :visible.sync="permissionDialogVisible"
      width="50%"
      @close="handleDialogClose"
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
        <el-button @click="permissionDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSavePermissions">保 存</el-button>
      </span>
    </el-dialog>

    <!-- 新增角色对话框 -->
    <el-dialog
      title="新增角色"
      :visible.sync="addDialogVisible"
      width="500px"
      @close="handleAddDialogClose"
    >
      <el-form ref="addForm" :model="addForm" :rules="addRules" label-width="80px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="addForm.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="addForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入描述"
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddSubmit">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getRoleList, saveRolePermission, addRole, deleteRole } from '@/api/role'
import { getRolePermissionTree } from '@/api/permission'

export default {
  name: 'RoleManage',
  data() {
    return {
      roleList: [],
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      permissionDialogVisible: false,
      currentRoleId: null,
      permissionTree: [],
      checkedPermissionIds: [],
      defaultExpandedKeys: [],
      treeProps: {
        children: 'children',
        label: 'name'
      },
      addDialogVisible: false,
      addForm: {
        name: '',
        description: ''
      },
      addRules: {
        name: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.loadRoleList()
  },
  methods: {
    async loadRoleList() {
      try {
        const response = await getRoleList({
          currentPage: this.pagination.currentPage,
          pageSize: this.pagination.pageSize
        })
        this.roleList = response.data?.records || []
        this.pagination.total = response.data?.total || 0
      } catch (error) {
        this.$message.error('加载角色列表失败')
      }
    },
    handleAdd() {
      this.addDialogVisible = true
    },
    async handleAddSubmit() {
      this.$refs.addForm.validate(async(valid) => {
        if (valid) {
          try {
            await addRole(this.addForm)
            this.$message.success('新增角色成功')
            this.addDialogVisible = false
            this.loadRoleList()
          } catch (error) {
            this.$message.error('新增角色失败')
          }
        }
      })
    },
    handleAddDialogClose() {
      this.addForm = {
        name: '',
        description: ''
      }
      this.$refs.addForm && this.$refs.addForm.resetFields()
    },
    async handleEdit(row) {
      this.currentRoleId = row.id
      this.permissionDialogVisible = true
      await this.loadPermissionTree()
    },
    async loadPermissionTree() {
      try {
        const response = await getRolePermissionTree(this.currentRoleId)
        const data = response.data
        this.permissionTree = data.permissionTree || []
        this.checkedPermissionIds = data.currentRolePermissionIdSet || []
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
    async handleSavePermissions() {
      try {
        const checkedKeys = this.$refs.permissionTree.getCheckedKeys()
        const halfCheckedKeys = this.$refs.permissionTree.getHalfCheckedKeys()
        const allPermissionIds = [...checkedKeys, ...halfCheckedKeys]
        await saveRolePermission({
          roleId: this.currentRoleId,
          permissionSet: allPermissionIds
        })
        this.$message.success('权限保存成功')
        this.permissionDialogVisible = false
      } catch (error) {
        this.$message.error('权限保存失败')
      }
    },
    handleDialogClose() {
      this.permissionTree = []
      this.checkedPermissionIds = []
      this.defaultExpandedKeys = []
      this.currentRoleId = null
    },
    handleSizeChange(val) {
      this.pagination.pageSize = val
      this.loadRoleList()
    },
    handleCurrentChange(val) {
      this.pagination.currentPage = val
      this.loadRoleList()
    },
    async handleDelete(row) {
      this.$confirm(`确定删除角色: ${row.name}?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          await deleteRole(row.id)
          this.$message.success('删除成功')
          this.loadRoleList()
        } catch (error) {
          this.$message.error('删除失败')
        }
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    }
  }
}
</script>

<style scoped>
.box-card {
  margin-bottom: 20px;
}
</style>
