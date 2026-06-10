<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>商品管理</span>
      </div>
      <el-form :inline="true" :model="queryForm" class="search-form">
        <el-form-item label="商品名">
          <el-input v-model="queryForm.name" placeholder="请输入商品名" clearable />
        </el-form-item>
        <el-form-item label="商品类型">
          <el-select v-model="queryForm.type" placeholder="请选择商品类型" clearable style="width: 150px;">
            <el-option label="数码" :value="1" />
            <el-option label="服装" :value="2" />
            <el-option label="食品" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button v-permission="505" type="success" :loading="exporting" @click="handleExport">导出</el-button>
        </el-form-item>
      </el-form>
      <el-table
        v-loading="listLoading"
        :data="goodsList"
        style="width: 100%"
      >
        <el-table-column
          prop="id"
          label="商品ID"
          width="120"
        />
        <el-table-column
          prop="name"
          label="商品名称"
          :min-width="200"
          show-overflow-tooltip
        />
        <el-table-column
          label="商品类型"
          width="120"
        >
          <template slot-scope="scope">
            {{ getTypeName(scope.row.type) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="price"
          label="价格（元）"
          width="140"
          align="center"
        >
          <template slot-scope="scope">
            ¥{{ scope.row.price != null ? Number(scope.row.price).toFixed(2) : '-' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="stock"
          label="库存（件）"
          width="120"
          align="center"
        />
        <el-table-column
          class-name="status-col"
          label="商品状态"
          width="120"
          align="center"
        >
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row.status)">{{ getStatusText(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="120"
          align="center"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-button
              v-permission="503"
              type="text"
              size="small"
              @click="handleViewDetail(scope.row)"
            >
              详情
            </el-button>
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

    <el-dialog
      title="商品详情"
      :visible.sync="detailDialogVisible"
      width="600px"
      :close-on-click-modal="false"
    >
      <div v-loading="detailLoading" class="detail-content">
        <el-form v-if="goodsDetail" ref="detailForm" :model="goodsDetail" label-width="100px">
          <el-form-item label="商品ID">
            <el-input v-model="goodsDetail.id" disabled />
          </el-form-item>
          <el-form-item label="商品名称">
            <el-input v-model="goodsDetail.name" placeholder="请输入商品名称" />
          </el-form-item>
          <el-form-item label="商品类型">
            <el-select v-model="goodsDetail.type" placeholder="请选择商品类型" style="width: 100%;">
              <el-option label="数码" :value="1" />
              <el-option label="服装" :value="2" />
              <el-option label="食品" :value="3" />
            </el-select>
          </el-form-item>
          <el-form-item label="价格（元）">
            <el-input-number v-model="goodsDetail.price" :precision="2" :step="0.01" :min="0" style="width: 100%;" />
          </el-form-item>
          <el-form-item label="库存（件）">
            <el-input-number v-model="goodsDetail.stock" :min="0" style="width: 100%;" />
          </el-form-item>
          <el-form-item label="商品状态">
            <el-select v-model="goodsDetail.status" placeholder="请选择商品状态" style="width: 100%;">
              <el-option label="待审核" :value="0" />
              <el-option label="上架" :value="1" />
              <el-option label="下架" :value="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="品牌">
            <el-input v-model="goodsDetail.brand" placeholder="请输入品牌" />
          </el-form-item>
          <el-form-item label="是否包邮">
            <el-switch v-model="goodsDetail.freeShipping" />
          </el-form-item>
          <el-form-item label="商品描述">
            <el-input
              v-model="goodsDetail.description"
              type="textarea"
              :rows="4"
              placeholder="请输入商品描述"
            />
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button v-permission="504" type="primary" :loading="saving" @click="handleSaveGoods">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getGoodsList, getGoodsDetail, updateGoods, exportGoods } from '@/api/goods'

export default {
  name: 'ProductGoods',
  data() {
    return {
      goodsList: [],
      listLoading: false,
      queryForm: {
        name: '',
        type: null
      },
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      detailDialogVisible: false,
      detailLoading: false,
      saving: false,
      exporting: false,
      goodsDetail: null
    }
  },
  created() {
    this.loadGoodsList()
  },
  methods: {
    async loadGoodsList() {
      this.listLoading = true
      try {
        const params = {
          currentPage: this.pagination.currentPage,
          pageSize: this.pagination.pageSize
        }
        if (this.queryForm.name) {
          params.name = this.queryForm.name
        }
        if (this.queryForm.type != null) {
          params.type = this.queryForm.type
        }
        const response = await getGoodsList(params)
        this.goodsList = response.data?.records || []
        this.pagination.total = response.data?.total || 0
      } catch (error) {
        this.$message.error('加载商品列表失败')
      } finally {
        this.listLoading = false
      }
    },
    async handleViewDetail(row) {
      this.detailDialogVisible = true
      this.detailLoading = true
      try {
        const response = await getGoodsDetail(row.id)
        this.goodsDetail = response.data
      } catch (error) {
        this.$message.error('加载商品详情失败')
      } finally {
        this.detailLoading = false
      }
    },
    async handleSaveGoods() {
      this.saving = true
      try {
        await updateGoods(this.goodsDetail)
        this.$message.success('保存成功')
        this.detailDialogVisible = false
        this.loadGoodsList()
      } catch (error) {
        this.$message.error('保存失败')
      } finally {
        this.saving = false
      }
    },
    async handleExport() {
      this.exporting = true
      try {
        const params = {}
        if (this.queryForm.name) {
          params.name = this.queryForm.name
        }
        if (this.queryForm.type != null) {
          params.type = this.queryForm.type
        }
        const response = await exportGoods(params)

        // 处理文件下载
        const blob = new Blob([response.data])
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.href = url

        // 从响应头获取文件名，如果没有则使用默认
        let fileName = '商品列表.xlsx'
        const disposition = response.headers?.['content-disposition']
        if (disposition) {
          const fileNameMatch = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
          if (fileNameMatch && fileNameMatch[1]) {
            fileName = decodeURIComponent(fileNameMatch[1].replace(/['"]/g, ''))
          }
        }

        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        this.$message.success('导出成功')
      } catch (error) {
        this.$message.error('导出失败')
      } finally {
        this.exporting = false
      }
    },
    handleQuery() {
      this.pagination.currentPage = 1
      this.loadGoodsList()
    },
    handleReset() {
      this.queryForm = {
        name: '',
        type: null
      }
      this.pagination.currentPage = 1
      this.loadGoodsList()
    },
    handleSizeChange(val) {
      this.pagination.pageSize = val
      this.loadGoodsList()
    },
    handleCurrentChange(val) {
      this.pagination.currentPage = val
      this.loadGoodsList()
    },
    getTypeName(type) {
      const typeMap = {
        1: '数码',
        2: '服装',
        3: '食品'
      }
      return typeMap[type] || '-'
    },
    getStatusType(status) {
      const statusMap = {
        0: 'warning',
        1: 'success',
        2: 'info'
      }
      return statusMap[status] || 'info'
    },
    getStatusText(status) {
      const statusMap = {
        0: '待审核',
        1: '上架',
        2: '下架'
      }
      return statusMap[status] || '-'
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
.detail-content {
  padding: 10px 0;
}
</style>
