<template>
  <div class="main">
    <!-- 搜索表单 -->
    <el-form ref="searchFormRef" :inline="true" :model="searchForm"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px] mb-4">
      <el-form-item label="标题：" prop="keyword">
        <el-input v-model="searchForm.keyword" placeholder="请输入标题" clearable class="!w-[180px]" />
      </el-form-item>
      <el-form-item label="流程类型：" prop="workflowId">
        <el-select v-model="searchForm.workflowId" placeholder="请选择流程类型" clearable class="!w-[180px]">
          <el-option v-for="item in workflowOptions" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态：" prop="status">
        <el-select v-model="searchForm.status" placeholder="请选择状态" clearable class="!w-[180px]">
          <el-option v-for="item in instanceStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="useRenderIcon('ri:search-line')" :loading="loading" @click="handleSearch">
          查询
        </el-button>
        <el-button :icon="useRenderIcon('ri:refresh-line')" @click="handleReset">
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 待办列表 -->
    <el-table v-loading="loading" :data="tableData" border stripe class="mt-4" style="width: 100%"
      height="calc(100vh - 300px)">
      <el-table-column label="标题" prop="title" min-width="180" show-overflow-tooltip />
      <el-table-column label="流程类型" prop="workflowName" min-width="120" align="center" />
      <el-table-column label="申请人" prop="initiator.nickname" min-width="100" align="center" />
      <el-table-column label="当前节点" min-width="120" align="center">
        <template #default="{ row }">
          {{ row.currentNode || row.approvers[0]?.nodeName || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="剩余处理时间" min-width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="getTimeoutTagType(row.approvers[0]?.timeLimit)" effect="light">
            {{ formatTimeLimit(row.approvers[0]?.timeLimit) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="申请详情" min-width="200" show-overflow-tooltip>
        <template #default="{ row }">
          <div v-if="row.workflowType === 'leave'">
            {{ formatLeaveInfo(row.formData) }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createdAt" min-width="160" align="center" />
      <el-table-column label="操作" fixed="right" width="180" align="center">
        <template #default="{ row }">
          <el-button v-if="canApprove(row)" type="primary" link @click="handleApprove(row)">
            审批
          </el-button>
          <el-button link @click="viewDetail(row)">
            查看
          </el-button>
        </template>
      </el-table-column>

      <template #empty>
        <div class="flex flex-col items-center justify-center py-10">
          <el-empty :image-size="180" description="暂无代办事项" />
        </div>
      </template>
    </el-table>

    <!-- 分页 -->
    <div class="flex justify-end mt-4">
      <el-pagination v-model:current-page="pagination.currentPage" v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]" :background="true" layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </div>

    <!-- 审批对话框 -->
    <el-dialog v-model="approveDialog.visible" title="审批处理" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules">
        <el-form-item label="审批动作" prop="action">
          <el-radio-group v-model="form.action">
            <el-radio label="approve">同意</el-radio>
            <el-radio label="reject">拒绝</el-radio>
            <el-radio label="transfer">转交</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 转交人选择 -->
        <el-form-item v-if="form.action === 'transfer'" label="转交给" prop="transferTo">
          <div class="flex items-center gap-2">
            <!-- 显示已选择的转交人 -->
            <div v-if="selectedTransferUser" class="flex items-center gap-2">
              <el-avatar :size="32" :src="selectedTransferUser.avatar">
                {{ selectedTransferUser.avatar ? '' : selectedTransferUser.nickname?.substring(0, 1) }}
              </el-avatar>
              <span>{{ selectedTransferUser.nickname }}</span>
            </div>
            <el-button link type="primary" @click="openUserSelector">
              {{ selectedTransferUser ? '重新选择' : '选择转交人' }}
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="审批意见" prop="comment">
          <el-input v-model="form.comment" type="textarea" :rows="4" :maxlength="500" show-word-limit
            placeholder="请输入审批意见" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="approveDialog.visible = false">取消</el-button>
        <el-button :loading="approveDialog.loading" type="primary" @click="approveSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 用户选择器 -->
    <user-selector v-model="userSelectorVisible" :dept-options="deptOptions" :role-options="roleOptions"
      :multiple="false" @confirm="handleUserSelected" />

    <!-- 详情抽屉 -->
    <el-drawer v-model="detailDrawer.visible" size="60%" :destroy-on-close="true">
      <!-- 自定义头部 -->
      <template #header>
        <div class="flex items-center justify-between w-full mr-4">
          <div class="flex items-center gap-3">
            <el-tag :type="getStatusType(detailData.status)" size="large">
              {{ getStatusText(detailData.status) }}
            </el-tag>
            <h2 class="text-lg m-0">{{ detailData.workflowName }}</h2>
          </div>
          <el-button-group>
            <!-- 审批操作按钮 -->
            <el-button v-if="canApprove(detailData)" :icon="useRenderIcon('ri:check-line')" type="primary"
              @click="handleApprove(detailData)">
              审批处理
            </el-button>
            <el-button :icon="Printer" @click="handlePrint" />
            <el-button :icon="Share" @click="handleShare" />
          </el-button-group>
        </div>
      </template>
      <!-- 水印 -->
      <el-watermark :content="detailData.initiator.nickname" :font="{
        color: 'rgba(0, 0, 0, 0.08)',
        fontSize: 16
      }" :rotate="-22" :z-index="9" class="w-full h-full" :repeat="true" :gap="[100, 100]">
        <div class="p-6 space-y-6">
          <!-- 步骤条 -->
          <div class="relative">
            <!-- 发起人信息 -->
            <div class="flex items-center gap-4 mb-6">
              <el-avatar :size="32" :src="detailData.initiator.avatar">
                {{ detailData.initiator.nickname?.substring(0, 1) }}
              </el-avatar>
              <div class="flex flex-col">
                <div class="flex items-center gap-2">
                  <span class="font-medium">{{ detailData.initiator.nickname }}</span>
                  <el-tag size="small" type="info">发起人</el-tag>
                </div>
                <span class="text-gray-500 text-sm">{{ detailData.createdAt }}</span>
              </div>
            </div>

            <!-- 审批人信息(会签) -->
            <div v-if="detailData.approvers?.length > 1" class="mt-4">
              <div class="text-gray-500 mb-2">当前审批人（会签）</div>
              <div class="flex flex-wrap gap-4">
                <div v-for="approver in detailData.approvers" :key="approver.userId"
                  class="flex items-center p-3 border rounded-lg" :class="getApproverStatusClass(approver)">
                  <el-avatar :size="32" :src="approver.avatar" class="mr-2">
                    {{ approver.nickname?.substring(0, 1) }}
                  </el-avatar>
                  <div class="flex flex-col">
                    <span class="font-medium">{{ approver.nickname }}</span>
                    <span class="text-sm">{{ approver.nodeName }}</span>
                  </div>
                  <!-- 审批状态标签 -->
                  <el-tag v-if="getApproverStatus(approver)" :type="getApproverStatusType(approver)" class="ml-2">
                    {{ getApproverStatusText(approver) }}
                  </el-tag>
                </div>
              </div>
            </div>

            <!-- 审批人信息(串行) -->
            <template v-else>
              <el-steps :active="getActiveStep()" finish-status="success" class="mb-8">
                <el-step title="发起申请" :description="detailData.createdAt">
                  <template #icon>
                    <el-avatar :size="24" :src="detailData.initiator.avatar">
                      {{ detailData.initiator.nickname?.substring(0, 1) }}
                    </el-avatar>
                  </template>
                </el-step>
                <el-step v-for="(approver, index) in detailData.approvers" :key="index" :title="approver.nodeName"
                  :description="approver.nickname">
                  <template #icon>
                    <el-avatar :size="24" :src="approver.avatar">
                      {{ approver.nickname?.substring(0, 1) }}
                    </el-avatar>
                  </template>
                </el-step>
              </el-steps>
            </template>
          </div>

          <el-card class="mb-4">
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
              <el-timeline-item v-for="record in detailData.records" :key="record.id"
                :type="getRecordType(record.action)" :timestamp="record.createdAt" :hollow="true">
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
      </el-watermark>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRenderIcon } from '@/components/ReIcon/src/hooks';
import UserSelector from '@/components/UserSelectorTable.vue';
import { deptTreeQuery } from '@/api/dept';
import { roleListQuery } from '@/api/role';
import { approveInstance, getInstanceDetail, listTodo } from '@/api/workflow-instance';
import { ApproveForm } from './utils/types';
import { instanceStatusOptions } from './utils/options';
import { downloadByUrl } from '@pureadmin/utils';
import {
  Printer,
  Share
} from '@element-plus/icons-vue';
import { message } from '@/utils/message';
import { useUserStoreHook } from '@/store/modules/user';
import dayjs from 'dayjs';
import { getWorkflowList } from '@/api/workflow';
import { useRoute } from 'vue-router';
import { getPurchaseTypeText, getUnitText, getExpenseTypeText } from "../instance/utils/enums"

const route = useRoute();
// 搜索表单
const searchFormRef = ref();
const searchForm = reactive({
  keyword: '',
  workflowId: null,
  status: null
});

// 流程类型选项
const workflowOptions = ref([]);
// 部门和角色数据
const deptOptions = ref([]);
const roleOptions = ref([]);
const userSelectorVisible = ref(false);
const selectedTransferUser = ref(null);

// 表格加载状态
const loading = ref(false);

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
});

// 表格数据
const tableData = ref([]);

// 格式化请假信息
const formatLeaveInfo = (formData: any) => {
  if (!formData) return '-';
  const leaveTypeMap = {
    annual: '年假',
    personal: '事假',
    sick: '病假'
  };
  return `${leaveTypeMap[formData.leaveType] || ''} ${formData.duration}天 (${formData.dateRange[0]} 至 ${formData.dateRange[1]})`;
};

// 格式化剩余处理时间
const formatTimeLimit = (timeLimit: number) => {
  if (!timeLimit) return '-';
  return `${timeLimit}小时`;
};

// 获取剩余时间标签类型
const getTimeoutTagType = (timeLimit: number): 'success' | 'warning' | 'danger' | 'info' => {
  if (!timeLimit) return 'info';
  if (timeLimit > 12) return 'success';
  if (timeLimit > 4) return 'warning';
  return 'danger';
};

// 查询
const handleSearch = async () => {
  if (loading.value) return;
  loading.value = true;
  try {
    const params = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      ...searchForm
    };
    const { data } = await listTodo(params);
    tableData.value = data.list;
    pagination.total = data.total;
  } catch (error) {
  } finally {
    loading.value = false;
  }
};

// 重置
const handleReset = () => {
  searchFormRef.value?.resetFields();
  pagination.currentPage = 1;
  handleSearch();
};

// 分页处理
const handleSizeChange = (val: number) => {
  pagination.pageSize = val;
  handleSearch();
};

const handleCurrentChange = (val: number) => {
  pagination.currentPage = val;
  handleSearch();
};

// 审批对话框
const approveDialog = reactive({
  visible: false,
  instanceId: '',
  loading: false
});

const form = reactive<ApproveForm>({
  action: 'approve',
  comment: '',
  transferTo: undefined
});

// 打开用户选择器
const openUserSelector = () => {
  userSelectorVisible.value = true;
};

// 用户选择确认
const handleUserSelected = (users: any[]) => {
  if (users.length > 0) {
    selectedTransferUser.value = users[0];
    form.transferTo = users[0].id;
  }
};

// 表单验证规则
const rules = {
  action: [{ required: true, message: '请选择审批动作' }],
  comment: [{ max: 500, message: '审批意见最多500字' }],
  transferTo: [{
    required: true,
    message: '请选择转交人',
    trigger: 'change',
    validator: (rule: any, value: any, callback: any) => {
      if (form.action === 'transfer' && !value) {
        callback(new Error('请选择转交人'));
      } else {
        callback();
      }
    }
  }]
};

// 格式化日期时间
const formatDateTime = (dateTimeStr: string) => {
  if (!dateTimeStr) return '-';
  return dayjs(dateTimeStr).format('YYYY-MM-DD HH:mm');
};

// 格式化日期范围
const formatDateRange = (dateRange: string[]) => {
  if (!dateRange?.length) return '-';
  return `${dateRange[0]} 至 ${dateRange[1]}`;
};


// 获取请假类型文本
const getLeaveTypeText = (type: string) => {
  const typeMap = {
    annual: '年假',
    personal: '事假',
    sick: '病假'
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

// 判断是否可以审批
const canApprove = (row) => {
  if (!row) return false;

  const currentUserId = useUserStoreHook().id;
  const records = row.records || [];

  // 1. 检查流程状态是否为处理中
  if (row.status !== 2) return false;

  // 2. 检查当前用户是否在审批人列表中
  if (!row.approvers?.some(a => a.userId === currentUserId)) return false;

  // 3. 获取当前节点名称
  const currentNodeName = row.currentNode;

  // 4. 查找与当前节点相关的记录
  const currentNodeRecords = records
    .filter(record => record.nodeName === currentNodeName)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // 5. 检查最新记录
  const latestRecord = currentNodeRecords[0];

  // 如果没有记录，说明是新节点，可以审批
  if (!latestRecord) return true;

  // 如果最新记录是转交，且转交给当前用户，可以审批
  if (latestRecord.action === 'transfer' &&
    row.approvers.some(a => a.userId === currentUserId)) {
    return true;
  }

  // 如果当前用户在当前节点已经有审批记录，且后面没有转交给自己的记录，则不能审批
  const userApproveRecord = currentNodeRecords
    .find(record => record.userId === currentUserId && record.action === 'approve');

  return !userApproveRecord;
};

// 审批处理
const handleApprove = (row: any) => {
  approveDialog.visible = true;
  approveDialog.instanceId = row.id;
};

// 审批提交
const approveSubmit = async () => {
  approveDialog.loading = true;
  try {
    const res = await approveInstance(approveDialog.instanceId, form);

    if (res) {
      approveDialog.visible = false;
      detailDrawer.visible = false;
      message('审批成功', { type: 'success' });
      handleSearch();
    }
  } catch (error) {
    console.error('审批失败:', error);
  } finally {
    approveDialog.loading = false;
  }

};

// 详情抽屉状态
const detailDrawer = reactive({
  visible: false
});
const detailData = ref({} as any);
// 查看详情
const viewDetail = async (row: any) => {
  const { data } = await getInstanceDetail(row.id);
  detailData.value = data;
  detailDrawer.visible = true;
};


// 消息推送的查看详情
const viewDetailByMessage = async (instanceId: string) => {
  try {
    const { data } = await getInstanceDetail(instanceId);
    detailData.value = data;
    detailDrawer.visible = true;
  } catch (error) {
  }
};

// 获取状态类型
const getStatusType = (status: number) => {
  const map = {
    1: 'info',    // 草稿
    2: 'warning', // 处理中
    3: 'success', // 通过
    4: 'danger',  // 拒绝
    5: 'info'     // 已撤销
  };
  return map[status] || 'info';
};

// 获取状态文本
const getStatusText = (status: number) => {
  const map = {
    1: '草稿',
    2: '处理中',
    3: '已通过',
    4: '已拒绝',
    5: '已撤销'
  };
  return map[status] || '未知状态';
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
// 打印处理
const handlePrint = () => {
  window.print();
};

// 分享处理
const handleShare = () => {
  // 复制链接到剪贴板
  const url = window.location.href;
  navigator.clipboard.writeText(url).then(() => {
    message('链接已复制到剪贴板', { type: 'success' });
  });
};

// 获取审批人状态样式类
const getApproverStatusClass = (approver: any) => {
  const status = getApproverStatus(approver);
  if (!status) return 'bg-white';
  return {
    'bg-green-50': status === 'approved',
    'bg-red-50': status === 'rejected',
    'bg-gray-50': status === 'transferred',
    'bg-white': !status
  };
};

// 获取审批人状态
const getApproverStatus = (approver: any) => {
  if (!detailData.value.records) return '';
  const record = detailData.value.records.find(r => r.userId === approver.userId);
  if (!record) return '';
  return record.action;
};

// 获取审批人状态类型
const getApproverStatusType = (approver: any) => {
  const status = getApproverStatus(approver);
  const typeMap = {
    approve: 'success',
    reject: 'danger',
    transfer: 'warning'
  };
  return typeMap[status] || 'info';
};

// 获取审批人状态文本
const getApproverStatusText = (approver: any) => {
  const status = getApproverStatus(approver);
  const textMap = {
    approve: '已同意',
    reject: '已拒绝',
    transfer: '已转交'
  };
  return textMap[status] || '待审批';
};

// 初始化
onMounted(async () => {
  if (route.query.id) {
    viewDetailByMessage(route.query.id.toString());
  }

  try {
    const [deptRes, roleRes]: any = await Promise.all([
      deptTreeQuery(),
      roleListQuery({ page: 1, pageSize: 999 })
    ]);
    deptOptions.value = deptRes.data?.departments || [];
    roleOptions.value = roleRes.data?.list || [];
  } catch (error) {
  }

  getWorkflowList({
    page: 1,
    pageSize: 999,
    status: 1
  }).then(res => {
    workflowOptions.value = res.data.list;
  });
  handleSearch();
});
</script>

<style lang="scss" scoped>
.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
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