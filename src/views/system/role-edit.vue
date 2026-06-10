<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>角色权限配置</span>
        <el-button style="float: right; padding: 3px 0" type="text" @click="handleBack">返回</el-button>
      </div>
      <el-tree
        ref="permissionTree"
        :data="permissionTree"
        :props="treeProps"
        show-checkbox
        node-key="id"
        check-strictly
        :default-checked-keys="checkedPermissionIds"
        highlight-current
      />
      <div style="margin-top: 20px; text-align: center;">
        <el-button @click="handleBack">取 消</el-button>
        <el-button type="primary" @click="handleSavePermissions">保 存</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import { getPermissionTree, saveRolePermission } from '@/api/role'

export default {
  name: 'RoleEdit',
  data() {
    return {
      roleId: null,
      permissionTree: [],
      checkedPermissionIds: [],
      treeProps: {
        children: 'children',
        label: 'name'
      }
    }
  },
  created() {
    this.roleId = this.$route.params.id
    this.loadPermissionTree()
  },
  methods: {
    async loadPermissionTree() {
      try {
        const response = await getPermissionTree(this.roleId)
        const data = response.data
        this.permissionTree = data.permissionTree || []
        this.checkedPermissionIds = data.currentRolePermissionIdSet || []
      } catch (error) {
        this.$message.error('获取权限树失败')
      }
    },
    async handleSavePermissions() {
      try {
        const checkedKeys = this.$refs.permissionTree.getCheckedKeys()
        await saveRolePermission({
          roleId: this.roleId,
          permissionSet: checkedKeys
        })
        this.$message.success('权限保存成功')
        this.handleBack()
      } catch (error) {
        this.$message.error('权限保存失败')
      }
    },
    handleBack() {
      this.$router.push('/role')
    }
  }
}
</script>

<style scoped>
.box-card {
  margin-bottom: 20px;
}
</style>
