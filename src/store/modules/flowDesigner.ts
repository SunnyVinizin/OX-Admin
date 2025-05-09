import {defineStore} from "pinia";
import {ref} from "vue";

export const useFlowDesignerStore = defineStore("flowDesigner", () => {
  // 节点数据
  const nodes = ref([
    {
      id: "start",
      type: "custom",
      data: {
        label: "开始",
        type: "start",
        config: {
          name: "",
          description: ""
        }
      },
      position: {x: 100, y: 100}
    }
  ]);

  // 边数据
  const edges = ref([]);

  // 添加节点
  const addNode = node => {
    nodes.value = [...nodes.value, node];
  };

  // 删除节点
  const removeNode = nodeId => {
    nodes.value = nodes.value.filter(node => node.id !== nodeId);
    // 同时删除相关的边
    edges.value = edges.value.filter(
      edge => edge.source !== nodeId && edge.target !== nodeId
    );
  };

  // 添加边
  const addEdge = edge => {
    edges.value = [...edges.value, edge];
  };

  // 更新节点配置
  const updateNodeConfig = (nodeId: string, config: any) => {
    const nodeIndex = nodes.value.findIndex(node => node.id === nodeId);
    if (nodeIndex !== -1) {
      const node = nodes.value[nodeIndex];
      const newConfig = {
        ...node.data.config,
        ...config
      };

      // 特殊处理审批人配置
      if (config.approvers) {
        newConfig.approvers = {
          userIds: config.approvers.userIds || [],
          users: config.approvers.users || [],
          required:
            config.approvers.required !== undefined
              ? config.approvers.required
              : true
        };
      }

      // 创建新的节点对象以触发响应式更新
      const updatedNode = {
        ...node,
        data: {
          ...node.data,
          config: newConfig
        }
      };

      // 更新数组以触发响应式
      nodes.value = [
        ...nodes.value.slice(0, nodeIndex),
        updatedNode,
        ...nodes.value.slice(nodeIndex + 1)
      ];
    }
  };

  // 清空所有节点和边
  const clearAll = () => {
    nodes.value = [];
    edges.value = [];
  };

  // 导入完整的流程图数据
  const importFlow = flowData => {
    if (flowData.nodes) {
      nodes.value = flowData.nodes;
    }
    if (flowData.edges) {
      edges.value = flowData.edges;
    }
  };

  // 导出完整的流程图数据
  const exportFlow = () => {
    return {
      nodes: nodes.value,
      edges: edges.value
    };
  };

  // 更新节点位置
  const updateNodePosition = (
    nodeId: string,
    position: {x: number; y: number}
  ) => {
    const nodeIndex = nodes.value.findIndex(node => node.id === nodeId);
    if (nodeIndex !== -1) {
      // 创建新的节点对象以触发响应式更新
      const updatedNode = {
        ...nodes.value[nodeIndex],
        position: {
          x: position.x,
          y: position.y
        }
      };

      // 更新数组以触发响应式
      nodes.value = [
        ...nodes.value.slice(0, nodeIndex),
        updatedNode,
        ...nodes.value.slice(nodeIndex + 1)
      ];
    }
  };

  return {
    nodes,
    edges,
    addNode,
    removeNode,
    addEdge,
    updateNodeConfig,
    clearAll,
    importFlow,
    exportFlow,
    updateNodePosition
  };
});
