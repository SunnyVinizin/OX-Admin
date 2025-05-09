<script setup>
import { ref, onMounted, nextTick, watch, computed } from 'vue'
import { VueFlow, useVueFlow, Panel } from '@vue-flow/core'
import { Controls } from '@vue-flow/controls'
import '@vue-flow/controls/dist/style.css'
import FlowNode from './FlowNode.vue'
import { ElDrawer, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElInputNumber, ElButton, ElMessage } from 'element-plus'
import { UserFilled, Switch, Download, Close, Plus, Upload } from '@element-plus/icons-vue'
import { useFlowDesignerStore } from '../store/modules/flowDesigner'
import { NodeType, ApproveType } from '../views/engine/workflow/utils/types'
import { nodeTemplates, templateOptions } from '../views/engine/workflow/utils/templates'
import UserSelector from './UserSelectorTable.vue'
import { deptTreeQuery } from "@/api/dept"
import { roleListQuery } from "@/api/role"

const flowStore = useFlowDesignerStore()
const selectedTemplate = ref('')

// 部门和角色数据
const deptOptions = ref([])
const roleOptions = ref([])
// 用户选择器控制
const userSelectorVisible = ref(false)
const currentEditNode = ref(null)

// 加载部门和角色数据
onMounted(async () => {
  try {
    const [deptRes, roleRes] = await Promise.all([
      deptTreeQuery(),
      roleListQuery({ page: 1, pageSize: 999 })
    ])
    deptOptions.value = deptRes.data?.departments || []
    roleOptions.value = roleRes.data?.list || []
  } catch { }
})

// 打开用户选择器
const openUserSelector = (node) => {
  currentEditNode.value = node
  userSelectorVisible.value = true
}

// 用户选择确认
const handleUserSelected = (selectedUsers) => {
  if (!currentEditNode.value) return;

  const config = {
    approvers: {
      userIds: selectedUsers.map(user => user.id),
      users: selectedUsers,
      required: true
    }
  };

  // 更新 store 中的节点配置
  flowStore.updateNodeConfig(currentEditNode.value.id, config);

  // 强制更新当前节点的显示
  if (currentNode.value && currentNode.value.id === currentEditNode.value.id) {
    currentNode.value = {
      ...currentNode.value,
      data: {
        ...currentNode.value.data,
        config: {
          ...currentNode.value.data.config,
          ...config
        }
      }
    };
  }

  // 关闭选择器
  userSelectorVisible.value = false;
};

// 移除审批人
const removeNodeUser = (node, userId) => {
  const config = { ...node.data.config }
  if (config.approvers) {
    config.approvers.userIds = config.approvers.userIds.filter(id => id !== userId)
    config.approvers.users = config.approvers.users.filter(user => user.id !== userId)

    // 更新 store 中的节点配置
    flowStore.updateNodeConfig(node.id, config)

    // 强制更新当前节点
    const updatedNode = flowStore.nodes.find(n => n.id === node.id)
    if (updatedNode) {
      if (currentNode.value && currentNode.value.id === node.id) {
        currentNode.value = { ...updatedNode }
      }
      if (currentEditNode.value && currentEditNode.value.id === node.id) {
        currentEditNode.value = { ...updatedNode }
      }
    }
  }
}

// 抽屉控制
const drawerVisible = ref(false)
const currentNode = ref(null)

const {
  project,
  setViewport,
  addNodes,
} = useVueFlow({
  defaultViewport: { x: 0, y: 0, zoom: 1 },
  defaultPosition: [0, 0],
  autoPanOnConnect: false,
  autoPanOnNodeDrag: false,
  snapToGrid: true,
  snapGrid: [10, 10],
  preventScrolling: true,
  zoomOnScroll: false,
  zoomOnPinch: false,
  zoomOnDoubleClick: false,
  panOnDrag: true,
  panOnScroll: false,
  elevateNodesOnSelect: false,
  fitView: false,
  fitViewOnInit: false,
  translateExtent: [
    [-1000, -1000],
    [2000, 2000]
  ]
})

// 初始化视图
onMounted(() => {
  // 设置初始视图位置和缩放
  setViewport({ x: 0, y: 0, zoom: 1 })
})

// 拖拽状态
const isDragging = ref(false)
const dragPreview = ref(null)

// 节点类型配置
const nodeTypes = [
  {
    type: 'approve',
    label: '审批节点',
    icon: UserFilled,
    nodeType: NodeType.APPROVE,
    defaultConfig: {
      approveType: ApproveType.ANY,
      timeLimit: 24,
      approvers: {
        userIds: [],
        users: [],
        required: true
      }
    }
  },
  {
    type: 'condition',
    label: '条件节点',
    icon: Switch,
    nodeType: NodeType.CONDITION,
    defaultConfig: {
      conditions: [
        {
          expression: '',
          nextNode: null
        }
      ]
    }
  },
  {
    type: 'end',
    label: '结束节点',
    icon: Close,
    nodeType: NodeType.END,
    defaultConfig: {}
  }
]

// 处理拖拽开始
const onDragStart = (event, nodeType) => {
  isDragging.value = true
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/vueflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'

    // 创建拖拽预览元素
    const preview = document.createElement('div')
    const nodeConfig = nodeTypes.find(n => n.type === nodeType)
    preview.className = `drag-preview ${nodeType}-node`
    preview.innerHTML = nodeConfig?.label || '节点'
    document.body.appendChild(preview)
    dragPreview.value = preview

    // 设置拖拽图像
    event.dataTransfer.setDragImage(preview, 75, 25)
  }
}

// 处理拖拽结束
const onDragEnd = () => {
  isDragging.value = false
  if (dragPreview.value) {
    document.body.removeChild(dragPreview.value)
    dragPreview.value = null
  }
}

// 处理拖拽放置
const onDrop = (event) => {
  const nodeType = event.dataTransfer?.getData('application/vueflow')
  const nodeConfig = nodeTypes.find(n => n.type === nodeType)
  if (!nodeConfig) return

  // 检查是否已存在结束节点
  if (nodeConfig.type === 'end' && flowStore.nodes.some(node => node.data.type === NodeType.END)) {
    ElMessage.warning('流程中只能有一个结束节点')
    return
  }

  // 获取画布元素
  const flowWrapper = event.target.closest('.vue-flow')
  if (!flowWrapper) return

  const { left, top } = flowWrapper.getBoundingClientRect()
  const position = project({
    x: event.clientX - left,
    y: event.clientY - top
  })

  // 计算新节点的 orderNum
  const maxOrderNum = Math.max(0, ...flowStore.nodes.map(node => node.data.orderNum || 0))
  let newOrderNum = maxOrderNum + 1

  // 如果是结束节点，需要更新其他节点的 orderNum
  if (nodeConfig.type === 'end') {
    // 将当前所有节点的 orderNum 加 1
    flowStore.nodes.forEach(node => {
      if (node.data.orderNum >= newOrderNum) {
        node.data.orderNum += 1
      }
    })
    // 结束节点始终是最后一个
    newOrderNum = maxOrderNum + 2
  }

  const newNode = {
    id: `${nodeType}-${Date.now()}`,
    type: 'custom',
    data: {
      label: nodeConfig.label,
      type: nodeConfig.nodeType,
      orderNum: newOrderNum,
      config: { ...nodeConfig.defaultConfig }
    },
    position: {
      x: position.x,
      y: position.y
    },
    dragHandle: '.node-drag-handle'
  }

  // 使用 store 添加节点
  flowStore.addNode(newNode)
}

// 处理拖拽悬停
const onDragOver = (event) => {
  event.preventDefault()
  if (isDragging.value) {
    event.dataTransfer.dropEffect = 'move'
  }
}

// 处理节点点击
const onNodeClick = (e) => {
  currentNode.value = flowStore.nodes.find(node => node.id === e.node.id)
  drawerVisible.value = true
}

// 处理连接
const onConnect = (params) => {
  const newEdge = {
    id: `edge-${params.source}-${params.target}`,
    source: params.source,
    target: params.target,
    type: 'smoothstep',
    animated: true
  }
  flowStore.addEdge(newEdge)
}

// 根据 orderNum 获取节点 ID
const getNodeIdByOrderNum = (orderNum) => {
  return flowStore.nodes.find(node => node.data.orderNum === orderNum)?.id
}

// 处理条件节点的自动连接
const handleConditionNodeConnections = (node) => {
  if (node.data.type === NodeType.CONDITION && node.data.config?.conditions) {
    // 移除该节点的所有出边
    flowStore.edges = flowStore.edges.filter(edge => edge.source !== node.id)

    // 为每个条件创建新的连接
    node.data.config.conditions.forEach(condition => {
      const targetNodeId = getNodeIdByOrderNum(condition.nextNode)
      if (targetNodeId) {
        const newEdge = {
          id: `edge-${node.id}-${targetNodeId}`,
          source: node.id,
          target: targetNodeId,
          type: 'smoothstep',
          animated: true,
          label: condition.expression, // 在连接线上显示条件表达式
          labelStyle: { fill: '#666', fontSize: 12 },
          labelBgStyle: { fill: '#fff', fillOpacity: 0.8 }
        }
        flowStore.addEdge(newEdge)
      }
    })
  }
}

// 监听节点变化，自动处理条件节点的连接
watch(() => flowStore.nodes, (nodes) => {
  nodes.forEach(node => {
    if (node.data.type === NodeType.CONDITION) {
      handleConditionNodeConnections(node)
    }
  })
}, { deep: true })

// 更新节点配置
const updateNodeConfig = () => {
  if (currentNode.value) {
    flowStore.updateNodeConfig(currentNode.value.id, currentNode.value.data.config)
  }
  drawerVisible.value = false
}

// 导入模板
const importTemplate = (templateType) => {
  const template = nodeTemplates[templateType]
  if (!template) {
    ElMessage.error('模板不存在')
    return
  }
  importNodes(template)
}

// 处理 JSON 文件导入
const handleFileImport = (uploadFile) => {
  if (!uploadFile.raw) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const template = JSON.parse(e.target.result)
      importNodes(template)
      ElMessage.success('导入成功')
    } catch (error) {
      ElMessage.error('导入失败：无效的 JSON 格式')
      console.error('导入失败:', error)
    }
  }
  reader.readAsText(uploadFile.raw)
}

// 统一的节点导入处理函数
const importNodes = (template) => {
  // 清空现有节点和边
  flowStore.clearAll()

  // 计算节点位置（从左到右斜向布局）
  const nodeSpacing = {
    x: 250, // 横向间距
    y: 100  // 纵向间距
  }
  const startX = 100
  const startY = 100

  // 转换模板节点为 VueFlow 节点
  template.forEach((node, index) => {
    const newNode = {
      id: `${node.type}-${Date.now()}-${index}`,
      type: 'custom',
      data: {
        label: node.name,
        type: node.type,
        orderNum: node.orderNum, // 保存 orderNum
        config: {
          ...(node.approveType !== undefined ? { approveType: node.approveType } : {}),
          ...(node.timeLimit !== undefined ? { timeLimit: node.timeLimit } : {}),
          ...(node.approvers !== undefined ? { approvers: node.approvers } : {}),
          ...(node.conditions !== undefined ? { conditions: node.conditions } : {})
        }
      },
      position: node.position || {
        x: startX + (index * nodeSpacing.x),
        y: startY + (index * nodeSpacing.y)
      },
      dragHandle: '.node-drag-handle'
    }
    flowStore.addNode(newNode)
  })

  // 等待节点创建完成后处理连接
  nextTick(() => {
    flowStore.nodes.forEach(node => {
      if (node.data.type === NodeType.CONDITION) {
        handleConditionNodeConnections(node)
      } else if (node.data.orderNum < template.length) {
        // 为非条件节点创建到下一个节点的连接
        const nextNode = flowStore.nodes.find(n => n.data.orderNum === node.data.orderNum + 1)
        if (nextNode && node.data.type !== NodeType.END) {
          flowStore.addEdge({
            id: `edge-${node.id}-${nextNode.id}`,
            source: node.id,
            target: nextNode.id,
            type: 'smoothstep',
            animated: true
          })
        }
      }
    })
  })
}

// 导出模板
const exportTemplate = () => {

  const template = flowStore.nodes
    .filter(node => node.data && node.data.type) // 过滤掉无效节点
    .map(node => {
      const baseNode = {
        name: node.data.label,
        type: node.data.type,
        orderNum: node.data.orderNum || 1,
        position: {
          x: Math.round(node.position.x),
          y: Math.round(node.position.y)
        }
      }

      // 根据节点类型添加特定配置
      if (node.data.type === NodeType.APPROVE) {
        return {
          ...baseNode,
          approveType: node.data.config.approveType,
          timeLimit: node.data.config.timeLimit,
          approvers: node.data.config.approvers
        }
      } else if (node.data.type === NodeType.CONDITION) {
        return {
          ...baseNode,
          conditions: node.data.config.conditions
        }
      }

      return baseNode
    })
    .sort((a, b) => a.orderNum - b.orderNum) // 按 orderNum 排序

  // 导出为 JSON 字符串
  const jsonStr = JSON.stringify(template, null, 2)

  // 创建并下载文件
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'workflow-template.json'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 获取可选的下一个节点列表（排除开始节点和当前节点）
const availableNextNodes = computed(() => {
  if (!currentNode.value) return []

  return flowStore.nodes
    .filter(node =>
      node.id !== currentNode.value.id &&
      node.data.type !== NodeType.START &&
      node.data.orderNum > currentNode.value.data.orderNum
    )
    .map(node => ({
      orderNum: node.data.orderNum,
      label: `${node.data.label} (节点${node.data.orderNum})`
    }))
    .sort((a, b) => a.orderNum - b.orderNum)
})

// 添加默认的 nextNode
const addCondition = (node) => {
  if (!node.data.config.conditions) {
    node.data.config.conditions = []
  }

  // 获取下一个可用的节点
  const nextAvailableNode = availableNextNodes.value[0]

  node.data.config.conditions.push({
    expression: '',
    nextNode: nextAvailableNode?.orderNum || null
  })
}

// 节点开始拖拽
const onNodeDragStart = (event) => {
}

// 节点拖拽中
const onNodeDrag = (event) => {
}

// 节点停止拖拽
const onNodeDragStop = (event) => {
  if (event.node) {
    flowStore.updateNodePosition(event.node.id, {
      x: Math.round(event.node.position.x),
      y: Math.round(event.node.position.y)
    })
  }
}

// 节点拖拽完成（可能包含多个节点）
const onNodesDragged = (nodes) => {
  nodes.forEach(node => {
    flowStore.updateNodePosition(node.id, {
      x: Math.round(node.position.x),
      y: Math.round(node.position.y)
    })
  })
}

// 获取模板数据
const getTemplate = () => {
  const template = flowStore.nodes
    .filter(node => node.data && node.data.type) // 过滤掉无效节点
    .map(node => {
      const baseNode = {
        name: node.data.label,
        type: node.data.type,
        orderNum: node.data.orderNum || 1,
        position: {
          x: Math.round(node.position.x),
          y: Math.round(node.position.y)
        }
      }

      // 根据节点类型添加特定配置
      if (node.data.type === NodeType.APPROVE) {
        return {
          ...baseNode,
          approveType: node.data.config.approveType,
          timeLimit: node.data.config.timeLimit,
          approvers: node.data.config.approvers
        }
      } else if (node.data.type === NodeType.CONDITION) {
        return {
          ...baseNode,
          conditions: node.data.config.conditions
        }
      }

      return baseNode
    })
    .sort((a, b) => a.orderNum - b.orderNum) // 按 orderNum 排序

  return template
}

// 加载模板数据
const loadTemplate = (nodes) => {
  console.log('接收到的节点数据:', nodes);

  // 清空现有节点和连线
  flowStore.clearAll();

  // 计算默认布局位置
  const defaultLayout = {
    startX: 100,
    startY: 100,
    horizontalGap: 250,
    verticalGap: 100
  };

  // 添加节点
  nodes.forEach((node, index) => {
    const { id, name, type, orderNum, approveType, timeLimit, settings } = node;

    // 处理节点配置
    let nodePosition;
    let nodeConfig = {
      approvers: { userIds: [], required: true },
      conditions: []
    };

    // 如果有 settings，说明是后端数据格式
    if (settings) {
      try {
        const parsedSettings = typeof settings === 'string' ? JSON.parse(settings) : settings;

        if (parsedSettings.position) {
          nodePosition = {
            x: Number(parsedSettings.position.x),
            y: Number(parsedSettings.position.y)
          };
        }

        if (type === 'approve' && parsedSettings.approvers) {
          nodeConfig.approvers = parsedSettings.approvers;
        } else if (type === 'condition' && parsedSettings.conditions) {
          nodeConfig.conditions = parsedSettings.conditions;
        }
      } catch { }
    } else {
      // 如果没有 settings，说明是模板格式
      nodePosition = node.position;
      if (type === 'approve') {
        nodeConfig.approvers = node.approvers;
      } else if (type === 'condition') {
        nodeConfig.conditions = node.conditions;
      }
    }

    // 如果没有位置信息，使用默认布局
    if (!nodePosition || typeof nodePosition.x !== 'number' || typeof nodePosition.y !== 'number') {
      if (type === 'condition') {
        // 条件节点放在下方
        nodePosition = {
          x: defaultLayout.startX + index * defaultLayout.horizontalGap,
          y: defaultLayout.startY + defaultLayout.verticalGap
        };
      } else {
        // 其他节点按顺序横向排列
        nodePosition = {
          x: defaultLayout.startX + index * defaultLayout.horizontalGap,
          y: defaultLayout.startY
        };
      }
    }

    // 创建节点配置
    const finalNodeConfig = {
      id: String(id || Date.now() + Math.random()),
      type: 'custom',
      position: nodePosition,
      data: {
        label: name,
        type,
        orderNum,
        config: {
          approveType,
          timeLimit,
          ...nodeConfig
        }
      },
      dragHandle: '.node-drag-handle'
    };

    flowStore.addNode(finalNodeConfig);
  });

  // 等待节点创建完成后添加连线
  nextTick(() => {
    nodes.forEach(node => {
      let conditions = [];

      // 获取条件配置
      if (node.settings) {
        try {
          const settings = typeof node.settings === 'string' ? JSON.parse(node.settings) : node.settings;
          conditions = settings.conditions || [];
        } catch (error) {
          console.error('Parse settings error:', error);
        }
      } else {
        conditions = node.conditions || [];
      }

      if (node.type === 'condition' && conditions.length) {
        // 条件节点的连线
        conditions.forEach((condition) => {
          const targetNode = nodes.find(n => n.orderNum === condition.nextNode);
          if (targetNode) {
            const edgeConfig = {
              id: `edge-${node.id}-${targetNode.id}`,
              source: String(node.id || ''),
              target: String(targetNode.id || ''),
              label: condition.expression,
              type: 'smoothstep',
              animated: true
            };
            flowStore.addEdge(edgeConfig);
          }
        });
      } else if (node.type !== 'end') {
        // 非条件节点的连线(除了结束节点)
        const nextNode = nodes.find(n => n.orderNum === node.orderNum + 1);
        if (nextNode) {
          const edgeConfig = {
            id: `edge-${node.id || Date.now()}-${nextNode.id || Date.now()}`,
            source: String(node.id || ''),
            target: String(nextNode.id || ''),
            type: 'smoothstep',
            animated: true
          };
          flowStore.addEdge(edgeConfig);
        }
      }
    });
  });
};

// 暴露方法给父组件
defineExpose({
  loadTemplate,
  getTemplate
})
</script>

<template>
  <div class="flow-designer">
    <div class="toolbar">
      <!-- 节点工具栏 -->
      <div class="toolbar-section">
        <div v-for="node in nodeTypes" :key="node.type" class="toolbar-node" :class="node.type + '-node'"
          draggable="true" @dragstart="onDragStart($event, node.type)" @dragend="onDragEnd">
          <el-icon>
            <component :is="node.icon" />
          </el-icon>
          {{ node.label }}
        </div>
      </div>

      <!-- 模板操作工具栏 -->
      <div class="toolbar-section">
        <el-button type="primary" @click="exportTemplate">
          <el-icon>
            <Download />
          </el-icon>
          导出模板
        </el-button>

        <!-- 添加 JSON 导入按钮 -->
        <el-upload class="upload-json" accept=".json" :show-file-list="false" :auto-upload="false"
          @change="handleFileImport">
          <el-button type="primary">
            <el-icon>
              <Upload />
            </el-icon>
            导入 JSON
          </el-button>
        </el-upload>

        <el-select v-model="selectedTemplate" class="!w-[150px]" placeholder="选择模板" @change="importTemplate">
          <el-option v-for="(item, key) in templateOptions" :key="key" :label="item.type" :value="item.value" />
        </el-select>
      </div>
    </div>

    <VueFlow v-model="flowStore.nodes" :edges="flowStore.edges" :default-zoom="1" :min-zoom="0.2" :max-zoom="4"
      :snap-to-grid="true" :snap-grid="[10, 10]" :auto-pan-on-node-drag="false" :prevent-scrolling="true"
      :zoom-on-scroll="true" :zoom-on-pinch="true" :zoom-on-double-click="false" :pan-on-scroll="false"
      :pan-on-drag="true" :elevate-nodes-on-select="false" :fit-view="false" :fit-view-on-init="false"
      :translate-extent="[[-1000, -1000], [2000, 2000]]" :default-viewport="{ x: 0, y: 0, zoom: 1 }"
      :class="{ 'dragging-over': isDragging }" class="flow-viewport" @connect="onConnect" @nodeClick="onNodeClick"
      @drop="onDrop" @dragover="onDragOver" @nodeDragStart="onNodeDragStart" @nodeDrag="onNodeDrag"
      @nodeDragStop="onNodeDragStop" @nodesDragged="onNodesDragged">
      <template #node-custom="props">
        <FlowNode :id="props.id" :data="props.data" />
      </template>

      <!-- 添加缩放控制面板 -->
      <Panel position="top-right" class="controls-panel">
        <Controls />
      </Panel>
    </VueFlow>

    <!-- 配置抽屉 -->
    <ElDrawer v-model="drawerVisible" title="节点配置" size="30%">
      <ElForm v-if="currentNode" label-width="100px">
        <ElFormItem label="节点名称">
          <ElInput v-model="currentNode.data.label" />
        </ElFormItem>

        <template v-if="currentNode.data.type === NodeType.APPROVE">
          <ElFormItem label="审批方式">
            <ElSelect v-model="currentNode.data.config.approveType">
              <ElOption :value="ApproveType.ANY" label="任意一人审批" />
              <ElOption :value="ApproveType.ALL" label="会签" />
              <ElOption :value="ApproveType.ORDER" label="按顺序审批" />
            </ElSelect>
          </ElFormItem>

          <ElFormItem label="审批时限">
            <ElInputNumber v-model="currentNode.data.config.timeLimit" :min="1" :max="72" :step="1" />
            <span class="ml-2">小时</span>
          </ElFormItem>

          <ElFormItem label="审批人">
            <div class="approvers-container">
              <!-- 已选审批人列表 -->
              <div v-if="currentNode.data.config.approvers?.users" class="approvers-list">
                <div v-for="user in currentNode.data.config.approvers.users" :key="user.id" class="approver-item">
                  <el-avatar :size="32" :src="user.avatar">
                    {{ user.nickname?.substring(0, 1) || user.username?.substring(0, 1) }}
                  </el-avatar>
                  <span class="approver-name">{{ user.nickname || user.username }}</span>
                  <el-icon class="remove-approver" @click="removeNodeUser(currentNode, user.id)">
                    <Close />
                  </el-icon>
                </div>
              </div>

              <!-- 添加审批人按钮 -->
              <el-button type="primary" plain @click="openUserSelector(currentNode)">
                <el-icon>
                  <Plus />
                </el-icon>
                选择审批人
              </el-button>
            </div>
          </ElFormItem>
        </template>

        <template v-if="currentNode.data.type === NodeType.CONDITION">
          <ElFormItem v-for="(condition, index) in currentNode.data.config.conditions" :key="index">
            <template #label>
              <div class="condition-form-label">条件{{ index + 1 }}</div>
            </template>
            <div class="condition-form-item">
              <ElInput v-model="condition.expression" class="!w-[300px]" type="textarea" :rows="3" :maxlength="200"
                show-word-limit placeholder="请输入条件表达式" />
              <ElFormItem label="下一个节点" class="next-node-select">
                <ElSelect v-model="condition.nextNode" placeholder="请选择下一个节点" class="!w-[200px]">
                  <ElOption v-for="node in availableNextNodes" :key="node.orderNum" :label="node.label"
                    :value="node.orderNum" />
                </ElSelect>
              </ElFormItem>
            </div>
          </ElFormItem>
          <ElFormItem>
            <ElButton type="primary" link @click="addCondition(currentNode)">
              <el-icon>
                <Plus />
              </el-icon>
              添加条件
            </ElButton>
          </ElFormItem>
        </template>

        <ElFormItem>
          <el-button type="primary" @click="updateNodeConfig">确定</el-button>
        </ElFormItem>
      </ElForm>
    </ElDrawer>

    <!-- 用户选择器 -->
    <UserSelector v-if="deptOptions.length && roleOptions.length" v-model="userSelectorVisible"
      :dept-options="deptOptions" :role-options="roleOptions" @confirm="handleUserSelected" />
  </div>
</template>

<style>
.flow-designer {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.toolbar {
  padding: 12px;
  border-bottom: 1px solid var(--el-border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.toolbar-section {
  display: flex;
  gap: 12px;
  align-items: center;
}

.toolbar-node {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  margin-right: 12px;
  background: var(--el-fill-color-light);
  color: var(--el-color-primary);
  border: 1px dashed var(--el-color-primary);
  border-radius: 4px;
  cursor: move;
  user-select: none;
  transition: all 0.3s ease;
}

.toolbar-node:hover {
  background: var(--el-color-primary-light-9);
  transform: translateY(-1px);
}

.toolbar-node .el-icon {
  font-size: 16px;
}

.approve-node {
  color: var(--el-color-primary);
  border-color: var(--el-color-primary);
}

.condition-node {
  color: var(--el-color-warning);
  border-color: var(--el-color-warning);
}

.end-node {
  color: var(--el-color-danger);
  border-color: var(--el-color-danger);
}

.flow-viewport {
  flex: 1;
  background: var(--el-bg-color-page);
  transition: all 0.3s ease;
  min-height: 0;
  /* 重要：防止溢出 */
}

.flow-viewport.dragging-over {
  background: var(--el-color-primary-light-9);
  box-shadow: inset 0 0 0 2px var(--el-color-primary);
}

/* 拖拽预览样式 */
.drag-preview {
  position: fixed;
  pointer-events: none;
  z-index: 1000;
  background: var(--el-bg-color);
  padding: 8px 16px;
  border-radius: 4px;
  box-shadow: var(--el-box-shadow-light);
  font-size: 14px;
  color: var(--el-color-primary);
  border: 1px solid var(--el-color-primary);
  opacity: 0.9;
}

/* 确保抽屉中的按钮样式正确 */
.el-drawer :deep(.el-button) {
  margin-left: 12px;
}

.controls-panel {
  padding: 8px;
  border-radius: 8px;
  background: var(--el-bg-color);
  box-shadow: var(--el-box-shadow-light);
}

/* 修改连接线样式 */
:deep(.vue-flow__edge) {
  path {
    stroke-width: 2;
    stroke: var(--el-color-primary);
  }
}

:deep(.vue-flow__edge.selected) {
  path {
    stroke: var(--el-color-primary);
    stroke-width: 3;
  }
}

:deep(.vue-flow__edge.animated) {
  path {
    stroke-dasharray: 5;
    animation: dashdraw 0.5s linear infinite;
  }
}

@keyframes dashdraw {
  from {
    stroke-dashoffset: 10;
  }
}

/* 调整节点间距 */
.flow-viewport {
  padding: 50px;
}

/* 缩放控制按钮样式 */
:deep(.vue-flow__controls) {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 8px;
  background: white;

  button {
    background: #f5f7fa;
    border: 1px solid #dcdfe6;
    margin: 2px 0;
    border-radius: 4px;
    color: #606266;

    &:hover {
      background: #ecf5ff;
      color: #409EFF;
    }

    &:active {
      background: #409EFF;
      color: white;
    }
  }
}

.approvers-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.approvers-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.approver-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  background: #f5f7fa;
  border-radius: 4px;
  position: relative;
}

.approver-name {
  font-size: 12px;
  color: #606266;
}

.remove-approver {
  padding: 2px;
  border-radius: 50%;
  background: #f56c6c;
  color: white;
  font-size: 12px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s;
}

.approver-item:hover .remove-approver {
  opacity: 1;
}

.remove-approver:hover {
  background: #f89898;
}

.el-form-item :deep(.el-textarea__inner) {
  font-family: monospace;
}

.condition-form-label {
  margin-bottom: 4px;
  font-weight: 500;
}

.condition-form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.next-node-select {
  margin-bottom: 0;
  width: 100%;
}

.next-node-select :deep(.el-form-item__label) {
  font-size: 12px;
  color: #606266;
}

.next-node-select :deep(.el-select) {
  width: 100%;
}

/* 上传按钮样式 */
.upload-json {
  display: inline-block;
  margin: 0 8px;

  :deep(.el-upload) {
    display: inline-block;
  }
}

/* 确保抽屉中的按钮样式正确 */
.el-drawer :deep(.el-button) {
  margin-left: 12px;
}
</style>
