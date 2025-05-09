<script setup lang="ts">
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { ref, computed, watch, getCurrentInstance } from "vue";
import Refresh from "@iconify-icons/ep/refresh";
import Dept from "@iconify-icons/ri/git-branch-line";
import More2Fill from "@iconify-icons/ri/more-2-fill";
import OfficeBuilding from "@iconify-icons/ep/office-building";
import LocationCompany from "@iconify-icons/ep/add-location";
import ExpandIcon from "./svg/expand.svg?component";
import UnExpandIcon from "./svg/unexpand.svg?component";

interface Tree {
  id: number;
  name: string;
  highlight?: boolean;
  children?: Tree[];
}

const props = defineProps({
  treeLoading: Boolean,
  treeData: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(["tree-select"]);

const treeRef = ref();
const isExpand = ref(true);
const highlightMap = ref({});
const { proxy } = getCurrentInstance();
const defaultProps = {
  children: "children",
  label: "deptName"
};
const buttonClass = computed(() => {
  return [
    "!h-[20px]",
    "!text-sm",
    "reset-margin",
    "!text-[var(--el-text-color-regular)]",
    "dark:!text-white",
    "dark:hover:!text-primary"
  ];
});

// 本地搜索过滤
const searchValue = ref("");
const searchKeyword = ref("");

// 添加过滤方法
const filterNode = (value: string, data: any) => {
  if (!value) return true;
  return data.deptName.toLowerCase().includes(value.toLowerCase());
};

// 处理清空
const handleClear = () => {
  searchValue.value = "";
  searchKeyword.value = "";
};

// 处理搜索
const handleSearch = () => {
  searchKeyword.value = searchValue.value.trim();
};

function nodeClick(value) {
  const nodeId = value.$treeNodeId;
  highlightMap.value[nodeId] = highlightMap.value[nodeId]?.highlight
    ? Object.assign({ id: nodeId }, highlightMap.value[nodeId], {
      highlight: false
    })
    : Object.assign({ id: nodeId }, highlightMap.value[nodeId], {
      highlight: true
    });
  Object.values(highlightMap.value).forEach((v: Tree) => {
    if (v.id !== nodeId) {
      v.highlight = false;
    }
  });
  emit(
    "tree-select",
    highlightMap.value[nodeId]?.highlight
      ? Object.assign({ ...value, selected: true })
      : Object.assign({ ...value, selected: false })
  );
}

function toggleRowExpansionAll(status) {
  isExpand.value = status;
  const nodes = (proxy.$refs["treeRef"] as any).store._getAllNodes();
  for (let i = 0; i < nodes.length; i++) {
    nodes[i].expanded = status;
  }
}

/** 重置部门树状态（选中状态、搜索框值、树初始化） */
function onTreeReset() {
  highlightMap.value = {};
  handleClear();
  toggleRowExpansionAll(true);
}

// 监听搜索关键字变化
watch(searchKeyword, val => {
  treeRef.value?.filter(val);
});

defineExpose({ onTreeReset });
</script>

<template>
  <div v-loading="treeLoading" class="tree-container h-full bg-bg_color overflow-hidden relative"
    :style="{ minHeight: `calc(100vh - 141px)` }">
    <!-- 搜索栏 -->
    <div class="flex items-center h-[45px] px-4 border-b border-[var(--el-border-color-light)]">
      <el-input v-model="searchValue" class="flex-1" size="default" placeholder="请输入部门名称" clearable
        @keyup.enter="handleSearch" @clear="handleClear">
        <template #prefix>
          <el-icon class="el-input__icon">
            <IconifyIconOffline icon="ri:search-line" />
          </el-icon>
        </template>
      </el-input>

      <el-dropdown :hide-on-click="true" class="ml-2">
        <el-button type="primary" size="default" plain>
          <IconifyIconOffline class="mr-1" :icon="More2Fill" />
          操作
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>
              <el-button :class="buttonClass" link type="primary"
                :icon="useRenderIcon(isExpand ? ExpandIcon : UnExpandIcon)"
                @click="toggleRowExpansionAll(isExpand ? false : true)">
                {{ isExpand ? "折叠全部" : "展开全部" }}
              </el-button>
            </el-dropdown-item>
            <el-dropdown-item>
              <el-button :icon="useRenderIcon(Refresh)" :class="buttonClass" link type="primary" @click="onTreeReset">
                重置
              </el-button>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 树形内容区 -->
    <el-scrollbar height="calc(90vh - 88px)" class="tree-content">
      <el-tree ref="treeRef" :data="props.treeData" node-key="id" :props="defaultProps" default-expand-all
        :expand-on-click-node="false" :filter-node-method="filterNode" @node-click="nodeClick">
        <template #default="{ node, data }">
          <div class="tree-node" :class="[
            'rounded-md',
            'flex',
            'items-center',
            'py-1',
            'px-2',
            'transition-all',
            'duration-300',
            'hover:bg-primary-100',
            highlightMap[node.id]?.highlight ? 'active-node' : ''
          ]">
            <IconifyIconOffline :icon="data.type === 1
              ? OfficeBuilding
              : data.type === 2
                ? LocationCompany
                : Dept
              " class="mr-2" />
            <span class="truncate" :title="node.label">
              {{ node.label }}
            </span>
          </div>
        </template>
      </el-tree>
    </el-scrollbar>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-divider) {
  margin: 0;
}

:deep(.el-tree) {
  --el-tree-node-hover-bg-color: transparent;
}

.search-header {
  .el-input {
    .el-input__wrapper {
      &:focus-within {
        box-shadow: 0 0 0 1px var(--el-color-primary) inset;
      }
    }
  }
}

.tree-container {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgb(0 0 0 / 5%);

  .tree-content {
    padding: 16px;

    :deep(.el-tree) {
      --el-tree-node-hover-bg-color: transparent;

      .el-tree-node__content {
        height: auto;
        padding: 4px 0;
      }
    }

    .tree-node {
      min-width: 200px;

      &:hover {
        color: var(--el-color-primary);
      }
    }
  }
}
</style>
