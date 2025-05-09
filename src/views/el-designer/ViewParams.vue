<template>
  <div class="view-params">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="树形视图" name="tree">
        <el-tree v-if="treeData.length" :data="treeData" :props="{ label: 'label', children: 'children' }" node-key="id"
          default-expand-all />
        <el-empty v-else description="暂无配置" />
      </el-tab-pane>
      <el-tab-pane label="JSON视图" name="json">
        <div class="json-view">
          <pre v-html="highlightedJson" />
        </div>
        <el-empty v-if="!highlightedJson" description="暂无配置" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

const props = defineProps({
  formConfig: {
    type: Object,
    default: () => ({})
  }
});

const activeTab = ref("tree");

// 将JSON数据转换为树形结构
const treeData = computed(() => {
  try {
    return jsonToTree(props.formConfig);
  } catch (e) {
    return [];
  }
});

// 格式化并高亮JSON
const highlightedJson = computed(() => {
  try {
    const formatted = JSON.stringify(props.formConfig, null, 2);
    return syntaxHighlight(formatted);
  } catch (e) {
    return '';
  }
});

// JSON转树形结构
function jsonToTree(obj: any, key = 'root'): any[] {
  if (typeof obj !== 'object' || obj === null) {
    return [{
      id: Math.random().toString(36).substr(2, 9),
      label: `${key}: ${obj}`,
    }];
  }

  const items = [];
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'object' && v !== null) {
      items.push({
        id: Math.random().toString(36).substr(2, 9),
        label: k,
        children: jsonToTree(v, k)
      });
    } else {
      items.push({
        id: Math.random().toString(36).substr(2, 9),
        label: `${k}: ${v}`
      });
    }
  }
  return items;
}

// JSON语法高亮
function syntaxHighlight(json: string) {
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    function (match) {
      let cls = 'number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'key';
        } else {
          cls = 'string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'boolean';
      } else if (/null/.test(match)) {
        cls = 'null';
      }
      return '<span class="' + cls + '">' + match + '</span>';
    });
}
</script>

<style lang="scss" scoped>
.view-params {
  padding: 20px;

  .json-view {
    border-radius: 4px;
    padding: 15px;
    background: var(--el-bg-color-page);

    pre {
      margin: 0;
      white-space: pre-wrap;
      word-wrap: break-word;
      font-family: Monaco, Consolas, Courier, monospace;
      font-size: 13px;
      line-height: 1.5;
    }
  }
}

:deep(.key) {
  color: #905;
}

:deep(.string) {
  color: #690;
}

:deep(.number) {
  color: #007bff;
}

:deep(.boolean) {
  color: #219;
}

:deep(.null) {
  color: #219;
}

// 树形视图样式优化
:deep(.el-tree) {
  padding: 15px;
  border-radius: 4px;
  background: var(--el-bg-color-page);

  .el-tree-node__content {
    height: 32px;
  }
}

// 标签页样式优化
:deep(.el-tabs__content) {
  padding: 15px 0;
}
</style>