<template>
  <div class="main">
    <el-form ref="formRef" :inline="true" :model="form" class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]">
      <el-form-item label="标题：" prop="keyword">
        <el-input v-model="form.keyword" placeholder="请输入标题" clearable class="!w-[180px]" />
      </el-form-item>
      <el-form-item label="流程类型：" prop="workflowId">
        <el-select v-model="form.workflowId" placeholder="请选择流程类型" clearable class="!w-[180px]">
          <el-option v-for="item in workflowOptions" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态：" prop="status">
        <el-select v-model="form.status" placeholder="请选择状态" clearable class="!w-[180px]">
          <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="useRenderIcon('ri:search-line')" :loading="loading" @click="onSearch">
          搜索
        </el-button>
        <el-button :icon="useRenderIcon('ri:refresh-line')" @click="resetForm">
          重置
        </el-button>
        <el-button type="primary" :icon="useRenderIcon('ri:add-circle-line')" @click="openCreateDialog">
          发起流程
        </el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="dataList" class="mt-4" border stripe height="calc(100vh - 300px)">
      <el-table-column label="标题" prop="title" min-width="180" show-overflow-tooltip align="center" />
      <el-table-column label="流程类型" prop="workflowName" min-width="120" align="center" />
      <el-table-column label="发起人" min-width="100" align="center">
        <template #default="{ row }">
          {{ row.initiator.nickname }}
        </template>
      </el-table-column>
      <el-table-column label="当前步骤" min-width="120" align="center">
        <template #default="{ row }">
          {{ row.currentNode ? row.currentNode : '流程已结束' }}
        </template>
      </el-table-column>
      <el-table-column label="状态" min-width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createdAt" min-width="160" align="center" />
      <el-table-column label="操作" fixed="right" width="180" align="center">
        <template #default="{ row }">
          <el-button link type="primary" :loading="row.viewLoading" @click="viewDetail(row)">
            查看
          </el-button>
          <el-button v-if="row.status === '处理中'" link type="danger" :icon="useRenderIcon('ri:close-circle-line')"
            @click="handleCancel(row)">
            撤销
          </el-button>
        </template>
      </el-table-column>
      <template #empty>
        <div class="flex flex-col items-center justify-center py-10">
          <el-empty :image-size="180" description="暂无流程实例" />
        </div>
      </template>
    </el-table>

    <!-- 分页 -->
    <div class="flex justify-end mt-4">
      <el-pagination v-model:current-page="pagination.currentPage" v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]" :background="true" layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </div>

    <!-- 发起审批抽屉 -->
    <el-drawer v-model="createDialog.visible" title="发起流程" size="50%" @close="handleDialogClose">
      <el-form ref="formRef" :rules="formRules" :validate-on-rule-change="false" :model="createDialog.form"
        label-width="100px">
        <el-form-item label="流程类型" prop="workflowCode" required>
          <el-select v-model="createDialog.form.workflowCode" placeholder="请选择流程类型" class="w-full">
            <el-option v-for="item in workflowOptions" :key="item.code" :label="item.name" :value="item.code" />
          </el-select>
        </el-form-item>
        <el-form-item label="标题" prop="title" required>
          <el-input v-model="createDialog.form.title" placeholder="请输入标题" />
        </el-form-item>

        <!-- 动态表单字段 -->
        <template v-if="currentWorkflow">
          <el-form-item v-for="field in currentWorkflow.formConfig?.fields" :key="field.name" :label="field.label"
            :prop="'formData.' + field.name">
            <!-- el-select -->
            <template v-if="field.type === 'el-select'">
              <el-select v-model="createDialog.form.formData[field.name]" v-bind="parseProps(field.props)"
                class="w-full">
                <el-option v-for="opt in parseProps(field.props).options" :key="opt.value" :label="opt.label"
                  :value="opt.value" />
              </el-select>
            </template>

            <!-- 请假时间特殊处理 -->
            <template v-else-if="field.type === 'el-date-picker'">
              <template
                v-if="field.calculateType === CalculateType.LEAVE_DAYS || field.calculateType === CalculateType.BUSINESS_DAYS">
                <div class="flex flex-col gap-2">
                  <!-- 开始时间 -->
                  <div class="flex gap-4">
                    <el-date-picker v-model="createDialog.form.formData[`${field.name}Start`]" :clearable="false"
                      :disabled-date="disabledDate" type="date" placeholder="开始日期" value-format="YYYY-MM-DD"
                      class="!w-[300px]" @change="value => handleDateChange(value, 'start', field)" />
                    <el-select v-model="createDialog.form.formData[`${field.name}StartPeriod`]" class="!w-[120px]"
                      placeholder="开始时段" @change="value => handleTimeRangeChange(value, 'start', field)">
                      <el-option label="上午" value="AM" />
                      <el-option label="下午" value="PM" />
                    </el-select>
                  </div>
                  <!-- 结束时间 -->
                  <div class="flex gap-4">
                    <el-date-picker v-model="createDialog.form.formData[`${field.name}End`]"
                      :disabled-date="disabledDate" type="date" placeholder="结束日期" value-format="YYYY-MM-DD"
                      class="!w-[300px]" @change="value => handleDateChange(value, 'end', field)" />
                    <el-select v-model="createDialog.form.formData[`${field.name}EndPeriod`]" class="!w-[120px]"
                      placeholder="结束时段" @change="value => handleTimeRangeChange(value, 'end', field)">
                      <el-option label="上午" value="AM" />
                      <el-option label="下午" value="PM" />
                    </el-select>
                  </div>

                  <!-- 说明文字 -->
                  <div class="text-gray-400 text-sm mt-1">
                    根据排班时间（上午9:00-12:00，下午13:00-18:00）自动计算请假时长
                  </div>
                </div>
              </template>
              <template v-else-if="field.calculateType === CalculateType.OVERTIME_HOURS">
                <div class="flex flex-col gap-2">
                  <div class="flex gap-4">
                    <el-date-picker v-model="createDialog.form.formData[field.name]" type="datetimerange"
                      range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间"
                      value-format="YYYY-MM-DD HH:mm:ss" :disabled-date="disabledOvertimeDate"
                      :disabled-time="disabledOvertimeTime" class="!w-[400px]"
                      @change="value => handleOvertimeChange(value, field)" />
                  </div>
                  <!-- 说明文字 -->
                  <div class="text-gray-400 text-sm mt-1">
                    加班时间将按实际工作时间计算，最小单位为0.5小时
                  </div>
                </div>
              </template>
              <!-- 其他日期选择器默认处理 -->
              <template v-else>
                <el-date-picker v-model="createDialog.form.formData[field.name]" v-bind="parseProps(field.props)"
                  :disabled-date="field.disablePast ? disabledDate : undefined" class="w-full" />
              </template>
            </template>

            <!-- el-input-number -->
            <template v-else-if="field.type === 'el-input-number'">
              <el-input-number v-model="createDialog.form.formData[field.name]" v-bind="parseProps(field.props)"
                class="w-full" />
            </template>

            <!-- el-upload -->
            <template v-else-if="field.type === 'el-upload'">
              <el-upload :file-list="createDialog.form.formData[field.name] || []"
                v-bind="parseUploadProps(field.props)" class="upload-demo"
                :http-request="(options) => customUpload(options, field.name)"
                :on-remove="(uploadFile) => handleUploadRemove(uploadFile, field.name)">
                <el-button type="primary">
                  <el-icon>
                    <Upload />
                  </el-icon>
                  选择文件
                </el-button>
                <template #tip>
                  <div class="el-upload__tip text-gray-500">
                    {{ parseProps(field.props).tip }}
                  </div>
                </template>
              </el-upload>
            </template>

            <!-- el-table -->
            <template v-else-if="field.type === 'el-table'">
              <div class="w-full">
                <el-table :data="createDialog.form.formData[field.name] || []" border>
                  <template v-for="col in parseProps(field.props).columns" :key="col.prop">
                    <el-table-column v-bind="col">
                      <template #default="scope">
                        <!-- 输入框 -->
                        <template v-if="col.type === 'input'">
                          <el-input v-model="scope.row[col.prop]" :placeholder="col.placeholder" />
                        </template>
                        <!-- 选择器 -->
                        <template v-else-if="col.type === 'select'">
                          <el-select v-model="scope.row[col.prop]" :placeholder="col.placeholder" class="w-full">
                            <el-option v-for="opt in col.options" :key="opt.value" :label="opt.label"
                              :value="opt.value" />
                          </el-select>
                        </template>
                        <!-- 数字输入框 -->
                        <template v-else-if="col.type === 'number'">
                          <el-input-number v-model="scope.row[col.prop]" :min="col.min" :max="col.max"
                            :precision="col.precision" :step="1" :controls="false" class="w-full" />
                        </template>
                        <!-- 计算列 -->
                        <template v-else-if="col.compute">
                          <span>{{ col.prefix }}{{ Number(scope.row[col.prop] || 0).toFixed(2) }}</span>
                        </template>
                        <!-- 默认显示 -->
                        <template v-else>
                          {{ scope.row[col.prop] }}
                        </template>
                      </template>
                    </el-table-column>
                  </template>
                </el-table>
                <!-- 添加/删除行按钮 -->
                <div class="flex justify-end gap-2 mt-2">
                  <el-button v-if="parseProps(field.props).removable" type="danger" link
                    @click="removeTableRow(field.name)">
                    删除行
                  </el-button>
                  <el-button v-if="parseProps(field.props).addable" type="primary" link
                    @click="addTableRow(field.name, parseProps(field.props).columns)">
                    添加行
                  </el-button>
                </div>
              </div>
            </template>

            <!-- el-input (默认) -->
            <template v-else>
              <el-input v-model="createDialog.form.formData[field.name]" v-bind="parseProps(field.props)" />
            </template>
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <div class="flex justify-end">
          <el-button @click="createDialog.visible = false">取消</el-button>
          <el-button type="primary" :loading="createDialog.loading" @click="handleCreate">
            确定
          </el-button>
        </div>
      </template>
    </el-drawer>


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
          <el-button-group>
            <!-- 处理中状态才显示撤销按钮 -->
            <el-button v-if="detailData.status === 2 && detailData.initiator.id === useUserStoreHook().id" type="danger"
              :icon="useRenderIcon('ri:close-circle-line')" @click="handleCancel(detailData)">
              撤销流程
            </el-button>
            <el-button :icon="useRenderIcon('ri:printer-line')" @click="handlePrint">
              打印
            </el-button>
          </el-button-group>
        </div>
      </template>

      <div class="p-6">
        <!-- 流程进度 -->
        <el-card class="mb-4">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="font-medium">流程进度</span>
              <el-tag>{{ detailData.currentNode || '-' }}</el-tag>
            </div>
          </template>
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
              <el-steps v-if="detailData.approvers?.length > 0" :active="getActiveStep()" finish-status="success"
                class="mb-8">
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
        </el-card>

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

        <!-- 审批进度 -->
        <el-card v-if="detailData.records?.length">
          <template #header>
            <div class="font-medium">审批进度</div>
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

      <!-- 水印 -->
      <el-watermark :content="[detailData.initiator.nickname, detailData.createdAt?.split(' ')[0]]" :font="{
        color: 'rgba(0, 0, 0, 0.08)',
        fontSize: 16
      }" />
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, h, watch } from "vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { message } from "@/utils/message";
import { listInstances, cancelInstance, createInstance, getInstanceDetail } from "@/api/workflow-instance";
import { dayjs, ElMessageBox, FormInstance, UploadRequestOptions } from "element-plus";
import { getWorkflowList } from "@/api/workflow";
import { useUserStoreHook } from '@/store/modules/user';
import { http } from "@/utils/http";
import { CalculateType } from "../workflow/utils/templates";
import { FormTemplateType } from "../workflow/utils/types";
import { getPurchaseTypeText, getUnitText, getExpenseTypeText } from "../instance/utils/enums"
import { downloadByUrl } from "@pureadmin/utils";
import { getDictByType } from "@/api/dict";
import { useRoute } from "vue-router";
defineOptions({
  name: "EngineInstance"
});

// 路由
const route = useRoute();
// 状态选项
const statusOptions = ref([]);

// 搜索表单数据
const form = reactive({
  keyword: "",
  workflowId: null,
  status: null
});

// 分页数据
const pagination = reactive({
  total: 0,
  pageSize: 10,
  currentPage: 1
});
// 列表数据
const loading = ref(false);
const dataList = ref([]);

// 表单ref
const formRef = ref<FormInstance>();
// 获取工作流列表
const workflowOptions = ref([]);
// 当前选中的工作流
const currentWorkflow = computed(() =>
  workflowOptions.value.find(item => item.code === createDialog.form.workflowCode)
);
// 禁用过去的日期
const disabledDate = (time: Date) => {
  return time.getTime() < dayjs().startOf('day').valueOf();
};
// 加班日期限制
const disabledOvertimeDate = (time: Date) => {
  const today = dayjs().startOf('day');
  // 只能选择今天和未来7天内的日期
  return time.getTime() < today.valueOf() ||
    time.getTime() > today.add(7, 'day').valueOf();
};
// 加班时间限制
const disabledOvertimeTime = (date: Date, type: 'start' | 'end') => {
  const hours = date.getHours();
  const minutes = date.getMinutes();

  return {
    // 开始时间：限制在 6:00 - 22:00 之间开始加班
    // 结束时间：可以到第二天凌晨 6:00
    hours: type === 'start'
      ? (hours < 6 || hours > 22 ? range(0, 24) : [])  // 开始时间 6:00-22:00
      : (hours > 6 && hours < 22 ? range(0, 24) : []),  // 结束时间可以到第二天 6:00
    minutes: minutes % 30 !== 0 ? range(0, 60) : [] // 限制只能选择整点和半点
  };
};
// 处理加班时间变化
const handleOvertimeChange = (value: [string, string], field: any) => {
  if (!value || !value[0] || !value[1]) {
    createDialog.form.formData.duration = 0;
    return;
  }

  const [start, end] = value;
  const startTime = dayjs(start);
  let endTime = dayjs(end);

  // 如果结束时间小于开始时间，说明跨天了
  if (endTime.isBefore(startTime)) {
    endTime = endTime.add(1, 'day');
  }

  // 计算时间差（小时）
  const diffHours = endTime.diff(startTime, 'hour', true);

  // 四舍五入到最近的0.5小时
  createDialog.form.formData.duration = Math.round(diffHours * 2) / 2;
};

// 生成范围数组的辅助函数
const range = (start: number, end: number) => {
  const result = [];
  for (let i = start; i < end; i++) {
    result.push(i);
  }
  return result;
};

// 发起审批弹窗
const createDialog = reactive<any>({
  visible: false,
  loading: false,
  form: {
    workflowCode: '',
    title: '',
    formData: {}
  }
});

// 判断是否为图片文件
const isImageFile = (filename: string) => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
  return imageExtensions.some(ext =>
    filename.toLowerCase().endsWith(ext)
  );
};

// 动态生成表单校验规则
const formRules = computed(() => {
  const rules: Record<string, any> = {
    workflowCode: [
      { required: true, message: '请选择流程类型', trigger: 'change' }
    ],
    title: [
      { required: true, message: '请输入标题', trigger: 'blur' },
      { min: 2, max: 50, message: '标题长度应为2-50个字符', trigger: 'blur' }
    ]
  };

  // 添加动态字段的校验规则
  if (currentWorkflow.value?.formConfig?.fields) {
    currentWorkflow.value.formConfig.fields.forEach(field => {
      const fieldRules = [];

      // 必填校验
      if (field.required) {
        // 对于请假时间字段，不添加校验规则
        if (field.type === 'el-date-picker' && field.calculateType === CalculateType.LEAVE_DAYS) {
          // 不添加校验规则
          return;
        } else if (field.type === 'el-upload') {
          return;
        } else {
          // 其他字段添加必填校验
          fieldRules.push({
            required: true,
            message: `请${field.type.includes('select') ? '选择' : '输入'}${field.label}`,
            trigger: field.type.includes('select') ? 'change' : 'blur'
          });
        }
      }

      // 根据字段类型添加特定校验规则
      switch (field.type) {
        case 'el-input':
          const props = parseProps(field.props);
          if (props.maxlength) {
            fieldRules.push({
              max: props.maxlength,
              message: `${field.label}最多${props.maxlength}个字符`,
              trigger: 'blur'
            });
          }
          break;
        case 'el-input-number':
          if (field.name === 'duration' && currentWorkflow.value?.code === FormTemplateType.LEAVE) {
            fieldRules.push({
              validator: (rule: any, value: any, callback: any) => {
                if (!value || value <= 0) {
                  callback(new Error('请假天数必须大于0'));
                  return;
                }

                // 获取请假类型
                const leaveType = createDialog.form.formData.leaveType;

                // 根据请假类型设置不同的最大天数限制
                let maxDays = 30; // 默认最大天数
                if (leaveType === 'annual') {
                  maxDays = 15; // 年假最多15天
                } else if (leaveType === 'personal') {
                  maxDays = 5;  // 事假最多5天
                } else if (leaveType === 'sick') {
                  maxDays = 30; // 病假最多30天
                }

                if (value > maxDays) {
                  callback(new Error(`${getLeaveTypeText(leaveType)}最多可请${maxDays}天`));
                  return;
                }

                callback();
              },
              trigger: ['change', 'blur']
            });
          }
          break;
        case 'el-date-picker':
          // 使用默认的必填校验
          fieldRules.push({
            required: field.required,
            message: `请选择${field.label}`,
            trigger: 'change'
          });
          break;
      }

      if (fieldRules.length > 0) {
        rules[`formData.${field.name}`] = fieldRules;
      }
    });
  }

  return rules;
});

// 打开发起流程对话框
function openCreateDialog() {
  createDialog.visible = true;
  createDialog.form = {
    workflowCode: '',
    title: '',
    formData: {}
  };

  // 当选择请假流程时，初始化时间段
  if (currentWorkflow.value?.formConfig?.fields) {
    const leaveDateField = currentWorkflow.value.formConfig.fields.find(
      field => field.calculateType === CalculateType.LEAVE_DAYS
    );
    if (leaveDateField) {
      // 默认设置为上午
      createDialog.form.formData[`${leaveDateField.name}StartPeriod`] = 'AM';
      createDialog.form.formData[`${leaveDateField.name}EndPeriod`] = 'AM';
    }
  }
}

// 关闭对话框时重置表单
function handleDialogClose() {
  formRef.value?.resetFields();
  createDialog.form = {
    workflowCode: '',
    title: '',
    formData: {}
  };
}

// 自定义上传方法
const customUpload = async (options: UploadRequestOptions, fieldName: string) => {
  const { file } = options;

  try {
    const formData = new FormData();
    formData.append("file", file as Blob);
    formData.append("directory", "attachments");

    const { success, data: url } = await http.request<any>("post", "/upload/file", {
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (success) {
      // 确保数组初始化
      if (!createDialog.form.formData[fieldName]) {
        createDialog.form.formData[fieldName] = [];
      }

      // 添加文件信息
      const fileInfo = {
        name: (file as File).name,
        url: url,
        status: 'success',
        uid: Date.now() // 添加唯一标识
      };

      // 检查是否已存在相同文件
      const existingIndex = createDialog.form.formData[fieldName].findIndex(
        (f: any) => f.name === fileInfo.name && f.url === fileInfo.url
      );

      if (existingIndex === -1) {
        createDialog.form.formData[fieldName].push(fileInfo);
      }

      message("上传成功", { type: "success" });
    }
  } catch (error) {
  }
};

// 处理移除文件
const handleUploadRemove = (uploadFile: any, fieldName: string) => {
  if (!createDialog.form.formData[fieldName]) return;

  const files = createDialog.form.formData[fieldName];
  const index = files.findIndex((file: any) =>
    file.name === uploadFile.name && (!uploadFile.url || file.url === uploadFile.url)
  );
  if (index > -1) {
    files.splice(index, 1);
  }
};

// 修改 parseUploadProps 函数
const parseUploadProps = (propsString: string) => {
  try {
    const props = JSON.parse(propsString);
    // 移除这些回调，因为我们现在单独处理
    delete props.onSuccess;
    delete props.onError;
    delete props.beforeUpload;
    return props;
  } catch (e) {
    console.error('解析 props 失败:', e);
    return {};
  }
};

// 发起流程
async function handleCreate() {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();

    // 处理表单数据
    const formData = { ...createDialog.form.formData };

    // 获取当前工作流的字段定义
    const fields = currentWorkflow.value?.formConfig?.fields || [];

    // 处理每个字段
    fields.forEach(field => {
      // 处理日期类型字段
      if (field.type === 'el-date-picker' && field.calculateType === CalculateType.LEAVE_DAYS || field.calculateType === CalculateType.BUSINESS_DAYS) {
        // 合并日期范围和时间段
        const startDate = formData[`${field.name}Start`];
        const endDate = formData[`${field.name}End`];
        const startPeriod = formData[`${field.name}StartPeriod`];
        const endPeriod = formData[`${field.name}EndPeriod`];

        if (startDate && endDate && startPeriod && endPeriod) {
          formData[field.name] = [
            `${startDate} ${startPeriod === 'AM' ? '上午' : '下午'}`,
            `${endDate} ${endPeriod === 'AM' ? '上午' : '下午'}`
          ];

          // 删除临时字段
          delete formData[`${field.name}Start`];
          delete formData[`${field.name}End`];
          delete formData[`${field.name}StartPeriod`];
          delete formData[`${field.name}EndPeriod`];
        }
      }

      // 处理上传类型字段
      if (field.type === 'el-upload' && formData[field.name]) {
        console.log('formData[field.name]', formData[field.name]);
        formData[field.name] = formData[field.name]
          .filter((file: any) => file.status === 'success')
          .map((file: any) => ({
            name: file.name,
            url: file.url
          }));
      }
    });

    // 更新处理后的数据
    createDialog.form.formData = formData;
    createDialog.loading = true;
    await createInstance(createDialog.form);
    message("发起成功", { type: "success" });
    createDialog.visible = false;
    onSearch();
  } catch (error) {
    console.error('提交失败:', error);
  } finally {
    createDialog.loading = false;
  }
}

// 处理日期变化
const handleDateChange = (value: string, type: 'start' | 'end', field: any) => {
  // 如果选择了日期，但没有选择时段，则默认设置为上午
  if (value) {
    if (type === 'start' && !createDialog.form.formData[`${field.name}StartPeriod`]) {
      createDialog.form.formData[`${field.name}StartPeriod`] = 'AM';
    }
    if (type === 'end' && !createDialog.form.formData[`${field.name}EndPeriod`]) {
      createDialog.form.formData[`${field.name}EndPeriod`] = 'AM';
    }
  }

  // 如果有开始和结束日期，自动计算时长
  calculateDuration(field);
};

// 处理时间段变化
function handleTimeRangeChange(value: string, type: 'start' | 'end', field: any) {
  calculateDuration(field);
}

// 计算请假天数
function calculateDuration(field: any) {
  const startDate = createDialog.form.formData[`${field.name}Start`];
  const endDate = createDialog.form.formData[`${field.name}End`];
  const startPeriod = createDialog.form.formData[`${field.name}StartPeriod`];
  const endPeriod = createDialog.form.formData[`${field.name}EndPeriod`];

  if (!startDate || !endDate || !startPeriod || !endPeriod) {
    return;
  }

  // 计算天数
  const days = dayjs(endDate).diff(dayjs(startDate), 'day') + 1;

  if (days < 1) {
    createDialog.form.formData.duration = 0;
    return;
  }

  let actualDays = days;

  // 如果是同一天
  if (days === 1) {
    if (startPeriod === endPeriod) {
      actualDays = 0.5; // 同一天的同一时段，算0.5天
    } else if (startPeriod === 'PM' && endPeriod === 'AM') {
      actualDays = 0; // 开始时间是下午，结束时间是上午，无效
    } else {
      actualDays = 1; // 开始时间是上午，结束时间是下午，算1天
    }
  } else {
    // 多天的情况
    if (startPeriod === 'PM') {
      actualDays -= 0.5; // 第一天下午开始，减去0.5天
    }
    if (endPeriod === 'AM') {
      actualDays -= 0.5; // 最后一天上午结束，减去0.5天
    }
  }

  createDialog.form.formData.duration = Math.max(0, actualDays);
}

// 解析 props 字符串为对象
function parseProps(propsStr: string) {
  try {
    const props = JSON.parse(propsStr);
    return props;
  } catch (e) {
    console.error('解析 props 失败:', e);
    return {};
  }
}

// 搜索
async function onSearch() {
  if (loading.value) return;
  loading.value = true;


  try {
    const params = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      ...form,
      status: Number(form.status),
    };

    const { data } = await listInstances(params);
    dataList.value = data.list;
    pagination.total = data.total;
  } catch (error) {
  } finally {
    loading.value = false;
  }
}

// 重置表单
function resetForm() {
  form.keyword = "";
  form.workflowId = null;
  form.status = null;
  onSearch();
}


// 详情数据
const detailData = ref<any>({});
const detailDrawer = reactive({
  visible: false
});

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

// 格式化请假类型
const getLeaveTypeText = (type: string) => {
  const map = {
    annual: '年假',
    sick: '病假',
    personal: '事假'
  };
  return map[type] || type;
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

// 获取审批动作文本
const getActionText = (action: string) => {
  const map = {
    approve: '同意',
    reject: '拒绝',
    transfer: '转交'
  };
  return map[action] || action;
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

// 打印处理
const handlePrint = () => {
  window.print();
};

// 获取当前步骤
const getActiveStep = () => {
  if (!detailData.value.records?.length) return 1;
  return detailData.value.records.length + 1;
};
// 查看详情
const viewDetail = async (row: any) => {
  if (row.viewLoading) return;
  try {
    row.viewLoading = true;
    const { data } = await getInstanceDetail(row.id);
    detailData.value = data;
    detailDrawer.visible = true;
  } catch (error) {
  } finally {
    row.viewLoading = false;
  }
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

// 撤销流程
async function handleCancel(row) {
  try {
    await ElMessageBox.confirm(`确认要撤销该流程吗？`, "提示", {
      type: "warning"
    });
    await cancelInstance(row.id);
    message("撤销成功", { type: "success" });
    detailDrawer.visible = false;
    onSearch();
  } catch (error) {
    // 处理错误
  }
}

// 分页处理
function handleSizeChange(val: number) {
  pagination.pageSize = val;
  onSearch();
}

function handleCurrentChange(val: number) {
  pagination.currentPage = val;
  onSearch();
}

// 添加行
const addTableRow = (fieldName: string, columns: any[]) => {
  if (!createDialog.form.formData[fieldName]) {
    createDialog.form.formData[fieldName] = [];
  }

  // 创建新行对象
  const newRow = {};
  columns.forEach(col => {
    if (col.type === 'number') {
      newRow[col.prop] = 0;
    } else {
      newRow[col.prop] = '';
    }
  });

  createDialog.form.formData[fieldName].push(newRow);
};

// 删除行
const removeTableRow = (fieldName: string) => {
  if (!createDialog.form.formData[fieldName]?.length) return;
  createDialog.form.formData[fieldName].pop();
};

// 监听采购清单变化，计算总价
watch(
  () => createDialog.form.formData.itemList,
  (newValue) => {
    if (!newValue) return;

    // 计算每一行的总价
    newValue.forEach(row => {
      if (row.quantity && row.price) {
        const quantity = Number(row.quantity) || 0;
        const price = Number(row.price) || 0;
        row.total = quantity * price;
      } else {
        row.total = 0;
      }
    });

    // 计算总金额
    const total = newValue.reduce((sum, row) => {
      const rowTotal = Number(row.total) || 0;
      return sum + rowTotal;
    }, 0);
    createDialog.form.formData.totalAmount = total;
  },
  { deep: true }
);

onMounted(() => {
  if (route.query.id) {
    viewDetailByMessage(route.query.id.toString());
  }

  getWorkflowList({
    page: 1,
    pageSize: 999,
    status: 1
  }).then(res => {
    workflowOptions.value = res.data.list;
    console.log('res.data.list', res.data.list);

    if (route.query.type) {
      const workflow = res.data.list.find(item => item.type === route.query.type);
      if (workflow) {
        createDialog.form.workflowCode = workflow.code;
        createDialog.visible = true
      }
    }
  });

  getDictByType('instance_status').then((res: any) => {
    statusOptions.value = res.data;
  });

  onSearch();
});
</script>

<style lang="scss" scoped>
.upload-demo {
  :deep(.el-upload-list) {
    max-height: 300px;
    overflow-y: auto;
  }

  :deep(.el-upload-list__item) {
    transition: all 0.3s;

    &:hover {
      background-color: var(--el-fill-color-light);
    }
  }
}
</style>
