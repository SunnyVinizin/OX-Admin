以下是整理后的 **Controlled Flow** 文档，重点突出如何精通受控流程的核心概念和实现步骤，帮助快速掌握并应用于项目：

---

## Controlled Flow

在 Vue Flow 中，受控模式允许你完全掌控节点和边的状态，而不是依赖 Vue Flow 的内部状态管理。使用受控模式时，所有数据变更都由开发者处理，使得状态更可控并易于集成到外部系统。

---

### 核心概念

- **受控模式的特点**:

  - 节点和边的数据必须通过组件的 `props` 提供。
  - 所有变更通过事件回调处理，如 `onNodesChange` 和 `onEdgesChange`。
  - Vue Flow 不会自动更新节点或边的状态，一切由开发者控制。

- **适用场景**:
  - 当需要将 Vue Flow 集成到更复杂的状态管理系统（如 Vuex 或 Pinia）。
  - 当需要自定义节点、边或画布的行为。
  - 当数据必须与外部 API 同步时。

---

### 如何实现受控模式

#### 1. 基本实现步骤

1. **提供受控数据**:
   - 使用 `nodes` 和 `edges` 属性传递节点和边数据。
2. **监听变更事件**:
   - 使用 `onNodesChange` 和 `onEdgesChange` 处理数据变更。
3. **更新状态**:
   - 在回调中更新父级组件的状态，使数据同步。

#### 2. 示例代码

以下是一个受控模式的基本示例：

```vue
<template>
  <VueFlow
    :nodes="nodes"
    :edges="edges"
    :fit-view="true"
    @nodesChange="onNodesChange"
    @edgesChange="onEdgesChange"
  />
</template>

<script>
import {ref} from "vue";

export default {
  setup() {
    const nodes = ref([
      {
        id: "1",
        position: {x: 100, y: 100},
        data: {label: "Node 1"}
      },
      {
        id: "2",
        position: {x: 300, y: 100},
        data: {label: "Node 2"}
      }
    ]);

    const edges = ref([
      {
        id: "e1-2",
        source: "1",
        target: "2"
      }
    ]);

    const onNodesChange = changes => {
      nodes.value = applyNodeChanges(changes, nodes.value);
    };

    const onEdgesChange = changes => {
      edges.value = applyEdgeChanges(changes, edges.value);
    };

    return {
      nodes,
      edges,
      onNodesChange,
      onEdgesChange
    };
  }
};
</script>
```

---

### 核心方法与技巧

1. **applyNodeChanges** 和 **applyEdgeChanges**

   - 这些工具函数用于处理节点或边的增删改操作，官方推荐在受控模式中使用。

   示例：

   ```javascript
   import {applyNodeChanges, applyEdgeChanges} from "@vue-flow/core";

   const updatedNodes = applyNodeChanges(changes, currentNodes);
   const updatedEdges = applyEdgeChanges(changes, currentEdges);
   ```

2. **事件回调**
   - **`@nodesChange`**: 监听节点变更事件。
   - **`@edgesChange`**: 监听边变更事件。
   - **`@connect`**: 处理新边连接事件。
   - **`@nodeClick`** 和 **`@edgeClick`**: 监听节点和边的点击事件。

---

### 高级用法

#### 1. 动态添加节点和边

在受控模式中，可以通过事件回调动态添加新节点或边。

```javascript
const onConnect = connection => {
  edges.value = addEdge(connection, edges.value);
};
```

结合模板：

```vue
<VueFlow :nodes="nodes" :edges="edges" @connect="onConnect" />
```

#### 2. 节点拖拽与位置更新

通过监听 `onNodesChange`，实现节点位置的受控更新：

```javascript
const onNodesChange = changes => {
  nodes.value = applyNodeChanges(changes, nodes.value);
};
```

#### 3. 与外部状态管理集成

当项目中使用 Vuex 或 Pinia 时，可以将节点和边的数据存储在全局状态中，并在事件回调中更新状态：

```javascript
import {useStore} from "vuex";

const store = useStore();

const onNodesChange = changes => {
  store.commit("updateNodes", applyNodeChanges(changes, store.state.nodes));
};

const onEdgesChange = changes => {
  store.commit("updateEdges", applyEdgeChanges(changes, store.state.edges));
};
```

---

### 快速掌握重点

1. **核心属性与方法**:

   - 属性：`nodes`、`edges`、`fit-view`
   - 方法：`applyNodeChanges`、`applyEdgeChanges`、`addEdge`

2. **事件回调**:

   - 常用：`onNodesChange`、`onEdgesChange`、`onConnect`
   - 高级：`onNodeClick`、`onEdgeClick`

3. **动态更新**:

   - 使用工具函数（如 `applyNodeChanges`）确保节点和边的状态始终同步。

4. **与外部系统集成**:
   - 将数据绑定到 Vuex、Pinia 或其他全局状态管理系统，实现完整受控。

---
