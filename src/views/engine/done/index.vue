<template>
  <div class="main">
    <!-- 搜索表单 -->
    <el-form ref="formRef" :inline="true" :model="form" class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]">
      <el-form-item label="标题：" prop="keyword">
        <el-input v-model="form.keyword" placeholder="请输入标题" clearable class="!w-[180px]" />
      </el-form-item>
      <el-form-item label="流程类型：" prop="workflowId">
        <el-select v-model="form.workflowId" placeholder="请选择流程类型" clearable class="!w-[180px]">
          <el-option v-for="item in workflowOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="处理结果：" prop="status">
        <el-select v-model="form.status" placeholder="请选择处理结果" clearable class="!w-[180px]">
          <el-option label="草稿" value="1" />
          <el-option label="处理中" value="2" />
          <el-option label="已完成" value="3" />
          <el-option label="已拒绝" value="4" />
          <el-option label="已取消" value="5" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="useRenderIcon('ri:search-line')" :loading="loading" @click="onSearch">
          搜索
        </el-button>
        <el-button :icon="useRenderIcon('ri:refresh-line')" @click="resetForm">
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 表格 -->
    <el-table v-loading="loading" :data="dataList" class="mt-4" border stripe>
      <el-table-column label="标题" prop="title" min-width="180" show-overflow-tooltip align="center" />
      <el-table-column label="流程类型" prop="workflowName" min-width="120" align="center" />
      <el-table-column label="发起人" min-width="120" align="center">
        <template #default="{ row }">
          <div class="flex items-center justify-center gap-2">
            <el-avatar :size="24" :src="row.initiator.avatar">
              {{ row.initiator.nickname?.substring(0, 1) }}
            </el-avatar>
            <span>{{ row.initiator.nickname }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="处理结果" min-width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="处理时间" prop="updatedAt" min-width="160" align="center" />
      <el-table-column label="操作" fixed="right" width="100" align="center">
        <template #default="{ row }">
          <el-button link type="primary" @click="viewDetail(row)">
            查看
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="flex justify-end mt-4">
      <el-pagination v-model:current-page="pagination.currentPage" v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]" :background="true" layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </div>

    <!-- 详情抽屉 -->
    <el-drawer v-model="detailDrawer.visible" size="60%" :destroy-on-close="true">
      <template #header>
        <div class="flex items-center justify-between w-full mr-4">
          <div class="flex items-center gap-3">
            <el-tag :type="getStatusType(detailData.status)" size="large">
              {{ getStatusText(detailData.status) }}
            </el-tag>
            <h2 class="text-lg m-0">{{ detailData.title }}</h2>
          </div>
        </div>
      </template>
      <div class="p-6 space-y-6">
        <el-card>
          <template #header>
            <div class="font-medium">申请信息</div>
          </template>
          <el-descriptions :column="2" border>
            <!-- 通用信息 -->
            <el-descriptions-item label="流程类型">{{ detailData.workflowName }}</el-descriptions-item>
            <el-descriptions-item label="申请人">{{ detailData.initiator.nickname }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>

            <!-- 根据工作流类型动态展示不同的表单信息 -->
            <template v-if="detailData.workflowType === 'leave'">
              <el-descriptions-item label="请假类型">
                {{ getLeaveTypeText(detailData.formData?.leaveType) }}
              </el-descriptions-item>
              <el-descriptions-item label="请假时长">
                {{ detailData.formData?.duration }}天
              </el-descriptions-item>
              <el-descriptions-item label="请假时间" :span="2">
                {{ formatDateRange(detailData.formData?.dateRange) }}
              </el-descriptions-item>
              <el-descriptions-item label="请假原因" :span="2">
                {{ detailData.formData?.reason }}
              </el-descriptions-item>
            </template>

            <!-- 加班信息展示 -->
            <template v-else-if="detailData.workflowType === 'overtime'">
              <el-descriptions-item label="加班时间" :span="2">
                {{ formatDateTime(detailData.formData?.dateTime?.[0]) }} 至
                {{ formatDateTime(detailData.formData?.dateTime?.[1]) }}
              </el-descriptions-item>
              <el-descriptions-item label="加班时长">
                {{ detailData.formData?.duration }}小时
              </el-descriptions-item>
              <el-descriptions-item label="加班事由" :span="2">
                {{ detailData.formData?.reason }}
              </el-descriptions-item>
            </template>

            <!-- 外出信息展示 -->
            <template v-else-if="detailData.workflowType === 'business'">
              <el-descriptions-item label="外出地点">
                {{ detailData.formData?.location }}
              </el-descriptions-item>
              <el-descriptions-item label="外出天数">
                {{ detailData.formData?.duration }}天
              </el-descriptions-item>
              <el-descriptions-item label="外出时间" :span="2">
                {{ formatDateRange(detailData.formData?.dateTime) }}
              </el-descriptions-item>
              <el-descriptions-item label="外出事由" :span="2">
                {{ detailData.formData?.reason }}
              </el-descriptions-item>
            </template>

            <!-- 报销信息展示 -->
            <template v-else-if="detailData.workflowType === 'expense'">
              <el-descriptions-item label="报销类型">
                {{ getExpenseTypeText(detailData.formData?.expenseType) }}
              </el-descriptions-item>
              <el-descriptions-item label="报销金额">
                <span class="text-red-500 font-medium">¥{{ detailData.formData?.amount?.toFixed(2) }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="费用发生日期">
                {{ detailData.formData?.expenseDate }}
              </el-descriptions-item>
              <el-descriptions-item label="申请人">
                <div class="flex items-center gap-2">
                  <el-avatar :size="24" :src="detailData.initiator?.avatar">
                    {{ detailData.initiator?.nickname?.substring(0, 1) }}
                  </el-avatar>
                  <span>{{ detailData.initiator?.nickname }}</span>
                </div>
              </el-descriptions-item>
              <el-descriptions-item label="报销事由" :span="2">
                {{ detailData.formData?.reason }}
              </el-descriptions-item>
            </template>

            <!-- 日报信息展示 -->
            <template v-else-if="detailData.workflowType === 'daily_report'">
              <el-descriptions-item label="日报日期">
                {{ detailData.formData?.reportDate }}
              </el-descriptions-item>
              <el-descriptions-item label="提交时间">
                {{ detailData.createdAt }}
              </el-descriptions-item>
              <el-descriptions-item label="今日总结" :span="2">
                <div class="whitespace-pre-wrap">{{ detailData.formData?.todaySummary }}</div>
              </el-descriptions-item>
              <el-descriptions-item label="明日计划" :span="2">
                <div class="whitespace-pre-wrap">{{ detailData.formData?.tomorrowPlan }}</div>
              </el-descriptions-item>
            </template>

            <!-- 采购信息展示 -->
            <template v-else-if="detailData.workflowType === 'purchase'">
              <el-descriptions-item label="采购类型">
                {{ getPurchaseTypeText(detailData.formData?.purchaseType) }}
              </el-descriptions-item>
              <el-descriptions-item label="预算编号">
                {{ detailData.formData?.budgetNo || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="采购清单" :span="2">
                <el-table :data="detailData.formData?.itemList || []" border size="small" class="w-full">
                  <el-table-column label="物品名称" prop="name" min-width="120" />
                  <el-table-column label="规格型号" prop="spec" min-width="120" />
                  <el-table-column label="单位" prop="unit" width="80">
                    <template #default="{ row }">
                      {{ getUnitText(row.unit) }}
                    </template>
                  </el-table-column>
                  <el-table-column label="数量" prop="quantity" width="80" align="right" />
                  <el-table-column label="预估单价" prop="price" width="100" align="right">
                    <template #default="{ row }">
                      ¥{{ Number(row.price).toFixed(2) }}
                    </template>
                  </el-table-column>
                  <el-table-column label="预估总价" prop="total" width="100" align="right">
                    <template #default="{ row }">
                      ¥{{ Number(row.total).toFixed(2) }}
                    </template>
                  </el-table-column>
                  <el-table-column label="备注" prop="remark" min-width="120" show-overflow-tooltip />
                </el-table>
              </el-descriptions-item>
              <el-descriptions-item label="采购总金额">
                <span class="text-red-500 font-medium">¥{{ detailData.formData?.totalAmount?.toFixed(2) }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="期望到货日期">
                {{ formatDateRange(detailData.formData?.deliveryDateRange) }}
              </el-descriptions-item>
              <el-descriptions-item label="采购用途" :span="2">
                <div class="whitespace-pre-wrap">{{ detailData.formData?.purpose }}</div>
              </el-descriptions-item>
              <el-descriptions-item label="供应商信息" :span="2">
                <div class="whitespace-pre-wrap">{{ detailData.formData?.supplierInfo || '-' }}</div>
              </el-descriptions-item>
            </template>

            <!-- 附件信息 -->
            <el-descriptions-item v-if="detailData.formData?.attachments?.length" label="附件" :span="2">
              <div class="flex flex-wrap gap-4">
                <div v-for="file in detailData.formData.attachments" :key="file.url"
                  class="flex items-center gap-2 p-2 border rounded hover:bg-gray-50">
                  <!-- 图片类型 -->
                  <template v-if="isImageFile(file.name)">
                    <el-image :src="file.url" :preview-src-list="[file.url]" fit="cover"
                      class="w-10 h-10 object-cover rounded">
                      <template #error>
                        <div class="flex items-center justify-center w-10 h-10 bg-gray-100 rounded">
                          <el-icon class="text-gray-400">
                            <Picture />
                          </el-icon>
                        </div>
                      </template>
                    </el-image>
                  </template>
                  <!-- 其他文件类型 -->
                  <template v-else>
                    <el-icon class="text-gray-400">
                      <Document />
                    </el-icon>
                  </template>
                  <span class="text-sm text-gray-600">{{ file.name }}</span>
                  <el-button type="text" :icon="useRenderIcon('ri:download-line')" class="ml-auto"
                    @click="downloadByUrl(file.url, file.name)">下载</el-button>
                </div>
              </div>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 审批记录卡片 -->
        <el-card v-if="detailData.records?.length">
          <template #header>
            <div class="font-medium">审批记录</div>
          </template>
          <el-timeline>
            <el-timeline-item v-for="record in detailData.records" :key="record.id" :type="getRecordType(record.action)"
              :timestamp="record.createdAt" :hollow="true">
              <div class="flex items-start gap-4 p-4 rounded-lg">
                <!-- 头像区域 -->
                <el-avatar :size="40" :src="record.avatar" class="flex-shrink-0">
                  {{ record.nickname?.substring(0, 1) }}
                </el-avatar>

                <!-- 内容区域 -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between mb-2">
                    <!-- 左侧用户信息 -->
                    <div class="flex flex-col">
                      <span class="font-medium">{{ record.nickname }}</span>
                      <span class="text-sm">{{ record.nodeName }}</span>
                    </div>
                    <!-- 右侧状态标签 -->
                    <el-tag :type="getRecordType(record.action)" size="small" class="flex-shrink-0">
                      {{ getActionText(record.action) }}
                    </el-tag>
                  </div>

                  <!-- 审批意见 -->
                  <div class="p-3 rounded-lg text-sm break-words">
                    {{ record.comment || '无审批意见' }}
                  </div>
                </div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRenderIcon } from '@/components/ReIcon/src/hooks';
import { listDone, getInstanceDetail } from '@/api/workflow-instance';
import { message } from '@/utils/message';
import { downloadByUrl } from '@pureadmin/utils';
import { getPurchaseTypeText, getUnitText, getExpenseTypeText } from "../instance/utils/enums"
defineOptions({
  name: "EngineDone"
});

// 搜索表单
const formRef = ref();
const form = reactive({
  workflowId: undefined, // 可选，注意类型是number
  status: undefined, // 可选，注意类型是number
  keyword: ''        // 可选
});

// 工作流选项
const workflowOptions = ref([
  { label: '请假审批', value: 7 },
  { label: '加班审批', value: 8 },
  { label: '外出审批', value: 9 },
  { label: '报销审批', value: 10 },
]);

// 加载状态
const loading = ref(false);

// 表格数据
const dataList = ref([]);

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
});

// 详情抽屉
const detailDrawer = reactive({
  visible: false
});
const detailData = ref<any>({});

// 搜索
const onSearch = async () => {
  if (loading.value) return;
  loading.value = true;
  try {
    const params = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      workflowId: form.workflowId ? Number(form.workflowId) : undefined,
      status: form.status ? Number(form.status) : undefined,
      keyword: form.keyword || undefined
    };
    const { data } = await listDone(params);
    dataList.value = data.list;
    pagination.total = data.total;
  } catch (error) {
    console.error('查询失败:', error);
  } finally {
    loading.value = false;
  }
};

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields();
  pagination.currentPage = 1;
  onSearch();
};

// 分页处理
const handleSizeChange = (val: number) => {
  pagination.pageSize = val;
  onSearch();
};

const handleCurrentChange = (val: number) => {
  pagination.currentPage = val;
  onSearch();
};

// 查看详情
const viewDetail = async (row: any) => {
  try {
    const { data } = await getInstanceDetail(row.id);
    detailData.value = data;
    detailDrawer.visible = true;
  } catch (error) {
    message('获取详情失败', { type: 'error' });
  }
};

// 获取处理结果类型
const getStatusType = (status: number) => {
  const statusMap = {
    1: 'warning',
    2: 'primary',
    3: 'success',
    4: 'danger',
    5: 'info'
  };
  return statusMap[status] || 'info';
};

// 获取处理结果文本
const getStatusText = (status: number) => {
  const statusMap = {
    1: '草稿',
    2: '处理中',
    3: '已完成',
    4: '已拒绝',
    5: '已取消'
  };
  return statusMap[status] || status;
};

// 获取审批记录类型
const getRecordType = (action: string) => {
  const map = {
    approve: 'success',
    reject: 'danger',
    transfer: 'warning'
  };
  return map[action] || 'info';
};

// 获取审批动作文本
const getActionText = (action: string) => {
  const map = {
    approve: '同意',
    reject: '拒绝',
    transfer: '转交'
  };
  return map[action] || action;
};

// 获取当前步骤
const getActiveStep = () => {
  if (!detailData.value.approvers?.length) return 1;
  return detailData.value.approvers.findIndex(a => a.userId === detailData.value.currentUser?.id) + 1;
};

// 格式化日期范围
const formatDateRange = (dateRange: string[]) => {
  if (!dateRange || !Array.isArray(dateRange)) return '-';
  return `${dateRange[0]} 至 ${dateRange[1]}`;
};

// 格式化日期时间
const formatDateTime = (datetime: string) => {
  if (!datetime) return '-';
  return datetime;
};

// 获取请假类型文本
const getLeaveTypeText = (type: string) => {
  const typeMap = {
    annual: '年假',
    personal: '事假',
    sick: '病假',
    marriage: '婚假',
    maternity: '产假',
    bereavement: '丧假'
  };
  return typeMap[type] || type;
};

// 判断是否为图片文件
const isImageFile = (filename: string) => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
  return imageExtensions.some(ext =>
    filename.toLowerCase().endsWith(ext)
  );
};

// 打印处理
const handlePrint = () => {
  window.print();
};

// 初始化
onMounted(() => {
  onSearch();
});
</script>

<style lang="scss" scoped>
.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}

:deep(.el-drawer__header) {
  margin-bottom: 0;
}

:deep(.el-card__header) {
  padding: 12px 16px;
  /* 减小卡片头部的内边距 */
}

:deep(.el-descriptions__cell) {
  padding: 12px 16px;
  /* 调整描述列表单元格的内边距 */
}

:deep(.el-timeline-item__node) {
  z-index: 1;
}

:deep(.el-timeline-item__wrapper) {
  padding-left: 28px;
}

:deep(.el-timeline-item__content) {
  min-height: auto;
}
</style>