<template>
  <div class="p-6 space-y-6">
    <!-- 顶部数据统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <el-card v-for="(stat, index) in statistics" :key="index"
        class="stat-card transform hover:scale-105 transition-all duration-300 border-0 hover:shadow-lg">
        <div class="flex items-center">
          <div class="icon-wrapper" :class="stat.color">
            <el-icon :size="24">
              <component :is="stat.icon" />
            </el-icon>
          </div>
          <div class="ml-4 flex-1">
            <div class="text-sm">{{ stat.label }}</div>
            <div class="text-2xl font-bold mt-1">
              <CountUp :start-val="0" :end-val="stat.value" :decimal-places="stat.decimals || 0" separator="," />
            </div>
            <div class="flex items-center mt-2 text-sm" :class="stat.trend > 0 ? 'text-emerald-500' : 'text-rose-500'">
              <el-icon>
                <component :is="stat.trend > 0 ? 'ArrowUpBold' : 'ArrowDownBold'" />
              </el-icon>
              <span class="ml-1">{{ Math.abs(stat.trend) }}%</span>
              <span class="text-gray-400 ml-2">较昨日</span>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 中部图表和快捷入口区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- 左侧折线图 -->
      <div class="lg:col-span-3">
        <el-card shadow="hover" class="border-0">
          <template #header>
            <div class="flex justify-between items-center">
              <span class="font-medium">工作流趋势</span>
              <el-radio-group v-model="timeRange" size="small">
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
                <el-radio-button label="year">全年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="trendChartRef" class="h-[400px]" />
        </el-card>
      </div>

      <!-- 右侧快捷入口 -->
      <div class="lg:col-span-1">
        <el-card shadow="hover" class="border-0 h-full">
          <template #header>
            <div class="flex items-center">
              <el-icon class="mr-2">
                <Menu />
              </el-icon>
              <span class="font-medium">快捷入口</span>
            </div>
          </template>
          <div class="grid grid-cols-2 gap-4">
            <div v-for="(entry, index) in quickEntries.slice(0, 8)" :key="index"
              class="quick-entry-card group cursor-pointer" @click="handleQuickEntry(entry.path)">
              <div class="flex flex-col items-center p-3 rounded-lg">
                <div :class="['entry-icon-wrapper mb-2 group-hover:scale-110 transition-transform', entry.bgColor]">
                  <el-icon :size="24">
                    <component :is="entry.icon" />
                  </el-icon>
                </div>
                <span class="text-sm font-medium text-center">{{ entry.label }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useECharts, UtilsEChartsOption } from "@pureadmin/utils"
import CountUp from 'vue-countup-v3'
import { Statistic } from './utils/types'
import { getInstanceStatistics } from '@/api/workflow-instance'

const router = useRouter()

// 处理快捷入口点击
const handleQuickEntry = (path: string) => {
  router.push(path)
}

// 顶部统计数据
const statistics = ref<Statistic[]>([
  {
    label: '待办事项',
    value: 0,
    trend: 0,
    icon: 'Timer',
    color: 'bg-blue-500/10 text-blue-500'
  },
  {
    label: '处理中',
    value: 0,
    trend: 0,
    icon: 'Loading',
    color: 'bg-amber-500/10 text-amber-500'
  },
  {
    label: '已完成',
    value: 0,
    trend: 0,
    icon: 'CircleCheck',
    color: 'bg-emerald-500/10 text-emerald-500'
  },
  {
    label: '已驳回',
    value: 0,
    trend: 0,
    icon: 'CircleClose',
    color: 'bg-rose-500/10 text-rose-500'
  }
])

// 快捷入口配置
const quickEntries = ref([
  {
    label: '请假申请',
    icon: 'Calendar',
    path: '/engine/instance/index?type=leave',
    bgColor: 'bg-blue-500/10 text-blue-500'
  },
  {
    label: '加班申请',
    icon: 'Timer',
    path: '/engine/instance/index?type=overtime',
    bgColor: 'bg-amber-500/10 text-amber-500'
  },
  {
    label: '出差申请',
    icon: 'Place',
    path: '/engine/instance/index?type=business',
    bgColor: 'bg-emerald-500/10 text-emerald-500'
  },
  {
    label: '报销申请',
    icon: 'Money',
    path: '/engine/instance/index?type=expense',
    bgColor: 'bg-purple-500/10 text-purple-500'
  },
  {
    label: '采购申请',
    icon: 'ShoppingCart',
    path: '/engine/instance/index?type=purchase',
    bgColor: 'bg-cyan-500/10 text-cyan-500'
  },
  {
    label: '我的待办',
    icon: 'Document',
    path: '/engine/todo/index',
    bgColor: 'bg-rose-500/10 text-rose-500'
  },
  {
    label: '已办事项',
    icon: 'CircleCheck',
    path: '/engine/done/index',
    bgColor: 'bg-green-500/10 text-green-500'
  },
  {
    label: '流程管理',
    icon: 'SetUp',
    path: '/engine/workflow/index',
    bgColor: 'bg-orange-500/10 text-orange-500'
  }
])

const statisticsLoading = ref(false)
const fetchStatistics = async () => {
  statisticsLoading.value = true
  const res = await getInstanceStatistics()
  if (res.success) {
    // 更新统计数据
    statistics.value[0].value = res.data.todoCount
    statistics.value[1].value = res.data.processingCount
    statistics.value[2].value = res.data.completedCount
    statistics.value[3].value = res.data.rejectedCount
  }
  statisticsLoading.value = false
}

// 时间范围选择
const timeRange = ref('week')

// 初始化趋势图表
const initTrendChart = () => {
  const options: UtilsEChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['待处理', '已完成', '已驳回'],
      bottom: '0%'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: '待处理',
        type: 'line',
        smooth: true,
        emphasis: {
          focus: 'series'
        },
        itemStyle: {
          color: '#409EFF'
        },
        data: [12, 15, 10, 18, 8, 6, 14]
      },
      {
        name: '已完成',
        type: 'line',
        smooth: true,
        emphasis: {
          focus: 'series'
        },
        itemStyle: {
          color: '#67C23A'
        },
        data: [20, 25, 18, 30, 15, 12, 22]
      },
      {
        name: '已驳回',
        type: 'line',
        smooth: true,
        emphasis: {
          focus: 'series'
        },
        itemStyle: {
          color: '#F56C6C'
        },
        data: [3, 5, 2, 4, 2, 1, 3]
      }
    ]
  }
  setTrendOptions(options)
}

// 监听时间范围变化
watch(timeRange, () => {
  updateTrendChart()
})

// 更新趋势图表
const updateTrendChart = () => {
  // 这里可以根据 timeRange 的值请求后端数据
  // 示例更新数据
  const options = {
    xAxis: {
      data: timeRange.value === 'week'
        ? ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        : timeRange.value === 'month'
          ? Array.from({ length: 30 }, (_, i) => `${i + 1}日`)
          : Array.from({ length: 12 }, (_, i) => `${i + 1}月`)
    }
    // ... 其他配置保持不变
  }
  setTrendOptions(options)
}

// 图表初始化
const trendChartRef = ref()
const { setOptions: setTrendOptions } = useECharts(trendChartRef)

onMounted(() => {
  initTrendChart()
  fetchStatistics()
})
</script>

<style lang="scss" scoped>
.stat-card {
  @apply rounded-lg;

  .icon-wrapper {
    @apply p-4 rounded-lg flex items-center justify-center;
    width: 56px;
    height: 56px;
  }
}

.quick-entry-card {
  .entry-icon-wrapper {
    @apply p-3 rounded-lg flex items-center justify-center;
    width: 48px;
    height: 48px;
  }

  &:hover {
    @apply shadow-sm;
  }
}

// 添加一些细微动画
.el-icon {
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.1);
  }
}

// 图表容器样式优化
.el-card {
  @apply overflow-hidden;

  &:hover {
    transform: translateY(-2px);
  }
}
</style>