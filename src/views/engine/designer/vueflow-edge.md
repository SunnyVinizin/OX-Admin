以下是整理后的 **Vue Flow Edge 属性 (Edge Props)** 内容，注重表达如何快速精通所有边 (Edge) 属性的使用，使 AI 或用户快速掌握关键知识：

---

### Vue Flow 边属性 (Edge Props)

Vue Flow 提供了灵活的边 (Edge) 配置，通过属性设置可以完全掌控边的行为、样式和连接逻辑。

---

#### 核心属性

1. **id (必填)**

   - **类型**: `string`
   - **描述**: 每条边的唯一标识符，用于区分和操作边。
   - **示例**:
     ```js
     { id: 'edge-1', source: 'node-1', target: 'node-2' }
     ```

2. **source (必填)**

   - **类型**: `string`
   - **描述**: 指定起始节点的 `id`。
   - **示例**:
     ```js
     { id: 'edge-2', source: 'node-1', target: 'node-3' }
     ```

3. **target (必填)**

   - **类型**: `string`
   - **描述**: 指定目标节点的 `id`。
   - **示例**:
     ```js
     { id: 'edge-3', source: 'node-2', target: 'node-4' }
     ```

4. **sourceHandle**

   - **类型**: `string`
   - **描述**: 指定起始节点的连接点 (Handle)，如果节点有多个连接点时非常有用。
   - **示例**:
     ```js
     { id: 'edge-4', source: 'node-5', sourceHandle: 'output-1', target: 'node-6' }
     ```

5. **targetHandle**

   - **类型**: `string`
   - **描述**: 指定目标节点的连接点 (Handle)。
   - **示例**:
     ```js
     { id: 'edge-5', source: 'node-7', target: 'node-8', targetHandle: 'input-1' }
     ```

6. **type**
   - **类型**: `string`
   - **描述**: 定义边的类型，用于渲染不同的边样式，例如 `default`、`smoothstep`、`step`、`straight` 等。
   - **示例**:
     ```js
     { id: 'edge-6', source: 'node-9', target: 'node-10', type: 'smoothstep' }
     ```

---

#### 样式与交互属性

7. **style**

   - **类型**: `CSSProperties`
   - **描述**: 内联样式，用于动态定制边的外观。
   - **示例**:
     ```js
     { id: 'edge-7', style: { stroke: 'red', strokeWidth: 2 } }
     ```

8. **animated**

   - **类型**: `boolean`
   - **描述**: 是否启用边的动画效果。默认为 `false`。
   - **示例**:
     ```js
     { id: 'edge-8', animated: true }
     ```

9. **label**

   - **类型**: `string | ReactNode`
   - **描述**: 边上的标签，可以显示文字或自定义内容。
   - **示例**:
     ```js
     { id: 'edge-9', label: 'Connection A → B' }
     ```

10. **labelStyle**

    - **类型**: `CSSProperties`
    - **描述**: 自定义边标签的样式。
    - **示例**:
      ```js
      { id: 'edge-10', label: 'Label Example', labelStyle: { fontSize: '12px', fill: 'blue' } }
      ```

11. **labelBgStyle**

    - **类型**: `CSSProperties`
    - **描述**: 设置标签背景样式，提升可读性。
    - **示例**:
      ```js
      { id: 'edge-11', label: 'Styled Label', labelBgStyle: { fill: 'white', stroke: 'black' } }
      ```

12. **labelBgPadding**

    - **类型**: `[number, number]`
    - **描述**: 设置标签背景的内边距，值为 `[水平, 垂直]`。
    - **示例**:
      ```js
      { id: 'edge-12', label: 'Padded Label', labelBgPadding: [4, 6] }
      ```

13. **labelBgBorderRadius**
    - **类型**: `number`
    - **描述**: 设置标签背景的圆角半径。
    - **示例**:
      ```js
      { id: 'edge-13', label: 'Rounded Label', labelBgBorderRadius: 6 }
      ```

---

#### 行为控制

14. **selectable**

    - **类型**: `boolean`
    - **描述**: 是否允许边被选中，默认值为 `true`。
    - **示例**:
      ```js
      { id: 'edge-14', selectable: false }
      ```

15. **zIndex**
    - **类型**: `number`
    - **描述**: 控制边的层叠顺序。
    - **示例**:
      ```js
      { id: 'edge-15', zIndex: 10 }
      ```

---

### 快速掌握边属性的要点

1. **核心配置**

   - 每条边必须包含 `id`、`source` 和 `target` 三个属性。
   - 使用 `sourceHandle` 和 `targetHandle` 精确控制连接点。

2. **样式与标签优化**

   - 配置 `style`、`label` 和相关的 `labelStyle` 属性，自定义边的外观和标注信息。
   - 启用 `animated` 属性为边添加动画效果，提高视觉吸引力。

3. **行为与交互控制**
   - 设置 `selectable` 决定边是否可选中。
   - 使用 `zIndex` 控制边的层级顺序，避免交互冲突。

---
