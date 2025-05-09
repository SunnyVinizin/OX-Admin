以下是整理后的 **Vue Flow Handle 属性 (Handle Props)**，以便快速掌握如何使用 Handle 连接点的所有功能属性：

---

### Vue Flow Handle 属性 (Handle Props)

Handle 是用于定义节点连接点的关键组件，通过自定义 Handle 属性，可以完全控制节点的连接行为和样式。

---

#### 核心属性

1. **type (必填)**

   - **类型**: `string`
   - **描述**: 定义连接点的类型，可选值为 `source` 或 `target`，分别表示起始点和终点。
   - **示例**:
     ```html
     <Handle type="source" position="right" />
     <Handle type="target" position="left" />
     ```

2. **position (必填)**
   - **类型**: `'top' | 'bottom' | 'left' | 'right'`
   - **描述**: 定义 Handle 在节点上的位置。
   - **示例**:
     ```html
     <Handle type="source" position="top" />
     ```

---

#### 样式与自定义

3. **id**

   - **类型**: `string`
   - **描述**: Handle 的唯一标识符，用于区分节点的多个连接点。
   - **示例**:
     ```html
     <Handle type="source" position="bottom" id="output-1" />
     ```

4. **style**

   - **类型**: `CSSProperties`
   - **描述**: 用于自定义 Handle 的内联样式。
   - **示例**:
     ```html
     <Handle
       type="target"
       position="right"
       :style="{ background: 'blue', borderRadius: '50%' }"
     />
     ```

5. **className**
   - **类型**: `string`
   - **描述**: 为 Handle 添加自定义的 CSS 类名，便于统一样式管理。
   - **示例**:
     ```html
     <Handle type="source" position="left" className="custom-handle" />
     ```

---

#### 连接行为控制

6. **isConnectable**

   - **类型**: `boolean`
   - **描述**: 是否允许 Handle 被连接。默认值为 `true`。
   - **示例**:
     ```html
     <Handle type="source" position="top" :isConnectable="false" />
     ```

7. **onConnect**

   - **类型**: `(connection: Connection) => void`
   - **描述**: 当连接事件触发时的回调函数，可用于自定义连接逻辑。
   - **示例**:
     ```html
     <Handle
       type="target"
       position="bottom"
       :onConnect="(params) => console.log('Connected:', params)"
     />
     ```

8. **connectable**

   - **类型**: `boolean`
   - **描述**: 是否允许通过该 Handle 发起连接。
   - **示例**:
     ```html
     <Handle type="source" position="right" :connectable="true" />
     ```

9. **idRequired**
   - **类型**: `boolean`
   - **描述**: 是否强制要求连接时必须有 `id` 属性。
   - **示例**:
     ```html
     <Handle type="source" position="top" :idRequired="true" />
     ```

---

#### 高级属性

10. **validConnection**

    - **类型**: `(connection: Connection) => boolean`
    - **描述**: 自定义连接的有效性判断逻辑，仅允许满足条件的连接成立。
    - **示例**:
      ```html
      <Handle
        type="source"
        position="left"
        :validConnection="(connection) => connection.target.includes('valid-node')"
      />
      ```

11. **dragHandle**
    - **类型**: `string`
    - **描述**: 设置可拖动的元素选择器，允许用户拖动连接线时更改目标。
    - **示例**:
      ```html
      <Handle type="source" position="bottom" dragHandle=".drag-area" />
      ```

---

### 快速掌握 Handle 属性的要点

1. **基本配置**

   - 每个 Handle 必须包含 `type` 和 `position` 属性，分别定义连接点的类型和位置。
   - 使用 `id` 属性区分多个 Handle。

2. **样式与外观**

   - 利用 `style` 和 `className` 自定义 Handle 的样式，配合全局 CSS 提升一致性。

3. **连接行为控制**

   - 使用 `isConnectable` 禁止某些 Handle 被连接。
   - 利用 `onConnect` 处理连接事件逻辑，例如动态更新边数据。
   - 通过 `validConnection` 定义连接条件，仅允许符合规则的连接成立。

4. **高级用法**
   - 设置 `dragHandle` 自定义可拖动区域，增强用户体验。
   - 结合 `idRequired` 强化连接点的唯一性和逻辑验证。

---
