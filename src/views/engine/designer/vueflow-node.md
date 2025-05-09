以下是整理后的内容，更加注重表达如何精通 Vue Flow 的所有节点属性（Node Props），以便 AI 或用户快速掌握关键知识：

---

### Vue Flow 节点属性 (Node Props)

Vue Flow 提供了灵活的节点属性配置，以下是所有支持的属性及其功能说明：

#### 核心属性

1. **id (必填)**

   - **类型**: `string`
   - **描述**: 每个节点的唯一标识符，用于节点的识别和操作。
   - **示例**:
     ```js
     { id: 'node-1', type: 'custom', data: { label: 'Example Node' } }
     ```

2. **type**

   - **类型**: `string`
   - **描述**: 节点的类型，用于自定义节点的渲染逻辑。
   - **示例**:
     ```js
     { id: 'node-2', type: 'input', data: { label: 'Input Node' } }
     ```

3. **data**

   - **类型**: `object`
   - **描述**: 节点的数据对象，可传递任意自定义内容。
   - **示例**:
     ```js
     { id: 'node-3', data: { label: 'Dynamic Data' } }
     ```

4. **position (必填)**

   - **类型**: `{ x: number; y: number }`
   - **描述**: 节点的初始位置，支持通过 `x` 和 `y` 指定坐标。
   - **示例**:
     ```js
     { id: 'node-4', position: { x: 100, y: 200 } }
     ```

5. **dragHandle**
   - **类型**: `string`
   - **描述**: CSS 选择器，定义节点可拖动区域。
   - **示例**:
     ```js
     { id: 'node-5', dragHandle: '.custom-handle' }
     ```

#### 样式与交互属性

6. **class**

   - **类型**: `string`
   - **描述**: 自定义节点的 CSS 类，用于样式定制。
   - **示例**:
     ```js
     { id: 'node-6', class: 'custom-node-class' }
     ```

7. **style**

   - **类型**: `CSSProperties`
   - **描述**: 内联样式，用于动态控制节点外观。
   - **示例**:
     ```js
     { id: 'node-7', style: { background: 'red', borderRadius: '10px' } }
     ```

8. **hidden**

   - **类型**: `boolean`
   - **描述**: 决定节点是否隐藏。默认为 `false`。
   - **示例**:
     ```js
     { id: 'node-8', hidden: true }
     ```

9. **resizable**
   - **类型**: `boolean`
   - **描述**: 是否允许节点大小可调整。默认为 `false`。
   - **示例**:
     ```js
     { id: 'node-9', resizable: true }
     ```

#### 节点行为

10. **draggable**

    - **类型**: `boolean`
    - **描述**: 是否允许节点拖拽。默认为 `true`。
    - **示例**:
      ```js
      { id: 'node-10', draggable: false }
      ```

11. **connectable**

    - **类型**: `boolean`
    - **描述**: 是否允许连接点连线。默认为 `true`。
    - **示例**:
      ```js
      { id: 'node-11', connectable: false }
      ```

12. **focusable**

    - **类型**: `boolean`
    - **描述**: 是否允许节点被聚焦。默认为 `true`。
    - **示例**:
      ```js
      { id: 'node-12', focusable: false }
      ```

13. **zIndex**
    - **类型**: `number`
    - **描述**: 控制节点的层叠顺序。
    - **示例**:
      ```js
      { id: 'node-13', zIndex: 10 }
      ```

---

### 快速掌握节点属性的要点

1. **基础配置**

   - 始终提供 `id` 和 `position` 属性作为节点的核心标识和布局定位。
   - 结合 `type` 属性定义不同的节点类型。

2. **样式与交互优化**

   - 使用 `class` 或 `style` 统一节点样式，灵活调整外观。
   - 根据需求配置 `draggable`、`connectable` 和 `hidden` 属性控制交互行为。

3. **高级控制**
   - 配置 `zIndex` 解决节点层级问题。
   - 使用 `dragHandle` 精确定义拖拽区域，增强用户体验。

通过以上内容，你可以快速掌握和灵活运用 Vue Flow 的所有节点属性，从而实现高效的节点管理与自定义。

---
