以下是整理后的 **Vue Flow Composables** 文档，重点突出如何精通每个可组合函数（Composable）的用法，以便快速掌握并应用于实际项目：

---

## Vue Flow Composables

Vue Flow 提供了多种 Composable 函数，允许开发者更灵活地操作节点、边和视图。以下是所有 Composable 的精简整理，带有功能介绍、核心属性和使用示例。

---

### 1. **useVueFlow**

#### 功能

`useVueFlow` 是 Vue Flow 的核心 Composable，提供对实例的全局访问，用于管理节点、边、视图和交互逻辑。

#### 提供的主要方法

- **节点操作**:
  - `addNodes`: 添加节点。
  - `removeNodes`: 删除节点。
  - `getNode`: 根据 ID 获取节点。
- **边操作**:
  - `addEdges`: 添加边。
  - `removeEdges`: 删除边。
  - `getEdge`: 根据 ID 获取边。
- **视图操作**:
  - `zoomIn` / `zoomOut`: 放大或缩小视图。
  - `fitView`: 自动适配视图到所有内容。
  - `setViewport`: 自定义设置视图区域。

#### 使用示例

```javascript
import {useVueFlow} from "@vue-flow/core";

export default {
  setup() {
    const vueFlow = useVueFlow();

    // 添加节点
    vueFlow.addNodes({
      id: "node-1",
      position: {x: 100, y: 100},
      data: {label: "My Node"}
    });

    // 缩放视图
    vueFlow.zoomIn();
  }
};
```

---

### 2. **useZoomPanHelper**

#### 功能

提供放缩和平移视图的快捷方法。

#### 提供的主要方法

- `zoomIn` / `zoomOut`: 缩放视图。
- `setCenter`: 设置视图中心点。
- `fitView`: 适配所有内容到视图。

#### 使用示例

```javascript
import {useZoomPanHelper} from "@vue-flow/core";

export default {
  setup() {
    const {zoomIn, zoomOut, fitView} = useZoomPanHelper();

    // 放大视图
    zoomIn();

    // 缩小视图
    zoomOut();

    // 适配视图
    fitView({padding: 0.1});
  }
};
```

---

### 3. **useEdges**

#### 功能

专注于边的操作，可独立管理边的增删查逻辑。

#### 提供的主要方法

- `getEdges`: 获取当前所有边。
- `addEdges`: 添加新边。
- `removeEdges`: 删除指定边。

#### 使用示例

```javascript
import {useEdges} from "@vue-flow/core";

export default {
  setup() {
    const {getEdges, addEdges, removeEdges} = useEdges();

    // 添加边
    addEdges({
      id: "edge-1",
      source: "node-1",
      target: "node-2"
    });

    // 获取所有边
    const edges = getEdges();

    // 删除边
    removeEdges(["edge-1"]);
  }
};
```

---

### 4. **useNodes**

#### 功能

专注于节点的管理，支持节点的增删查操作。

#### 提供的主要方法

- `getNodes`: 获取当前所有节点。
- `addNodes`: 添加新节点。
- `removeNodes`: 删除指定节点。

#### 使用示例

```javascript
import {useNodes} from "@vue-flow/core";

export default {
  setup() {
    const {getNodes, addNodes, removeNodes} = useNodes();

    // 添加节点
    addNodes({
      id: "node-1",
      position: {x: 200, y: 200},
      data: {label: "Example Node"}
    });

    // 获取所有节点
    const nodes = getNodes();

    // 删除节点
    removeNodes(["node-1"]);
  }
};
```

---

### 5. **useViewport**

#### 功能

提供对视口 (Viewport) 的详细控制。

#### 提供的主要方法

- `getViewport`: 获取当前视口信息。
- `setViewport`: 自定义视口位置和缩放级别。

#### 使用示例

```javascript
import {useViewport} from "@vue-flow/core";

export default {
  setup() {
    const {getViewport, setViewport} = useViewport();

    // 获取视口信息
    const viewport = getViewport();

    // 设置视口
    setViewport({x: 0, y: 0, zoom: 1.5});
  }
};
```

---

### 6. **useNodeId**

#### 功能

提供生成唯一节点 ID 的方法，确保节点 ID 的唯一性。

#### 提供的主要方法

- `getNodeId`: 生成唯一节点 ID。

#### 使用示例

```javascript
import {useNodeId} from "@vue-flow/core";

export default {
  setup() {
    const {getNodeId} = useNodeId();

    // 生成新节点 ID
    const newNodeId = getNodeId("node");
    console.log(newNodeId); // node-1, node-2, ...
  }
};
```

---

### 快速掌握重点

1. **全局控制**:

   - 使用 `useVueFlow` 操作整个画布，包括节点、边和视图的全局管理。
   - 常用方法包括 `addNodes`、`addEdges`、`zoomIn` 和 `fitView`。

2. **独立操作**:

   - 分别使用 `useNodes` 和 `useEdges` 管理节点和边，保持逻辑清晰。
   - 配合 `useViewport` 精准调整视图位置和缩放。

3. **唯一性管理**:

   - 使用 `useNodeId` 确保节点 ID 的唯一性。

4. **放缩与平移**:
   - 使用 `useZoomPanHelper` 快速实现视图的缩放与平移操作。

---
