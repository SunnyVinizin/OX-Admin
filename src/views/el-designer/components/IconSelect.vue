<script setup lang="ts">
import { ref, computed } from 'vue'
import * as ElementPlusIcons from '@element-plus/icons-vue'
import { Search } from '@element-plus/icons-vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits(['update:modelValue'])

// 搜索关键字
const searchKey = ref('')

// 所有图标列表
const iconList = Object.keys(ElementPlusIcons).map(key => ({
  name: key,
  component: ElementPlusIcons[key as keyof typeof ElementPlusIcons]
}))

// 过滤后的图标列表
const filteredIcons = computed(() => {
  if (!searchKey.value) return iconList
  return iconList.filter(icon =>
    icon.name.toLowerCase().includes(searchKey.value.toLowerCase())
  )
})

// 选择图标
const handleSelect = (iconName: string) => {
  emit('update:modelValue', iconName)
}

// 清空选择
const handleClear = () => {
  emit('update:modelValue', '')
}
</script>

<template>
  <div class="icon-select">
    <div class="search-bar">
      <el-input v-model="searchKey" placeholder="搜索图标" clearable>
        <template #prefix>
          <el-icon>
            <Search />
          </el-icon>
        </template>
        <template #append>
          <el-button type="primary" link @click="handleClear">
            清空选择
          </el-button>
        </template>
      </el-input>
    </div>

    <div class="icons-container">
      <el-scrollbar height="300px">
        <div class="icons-grid">
          <div v-for="icon in filteredIcons" :key="icon.name" class="icon-item"
            :class="{ active: modelValue === icon.name }" @click="handleSelect(icon.name)">
            <el-icon>
              <component :is="icon.name" />
            </el-icon>
            <span class="icon-name">{{ icon.name }}</span>
          </div>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.icon-select {
  .search-bar {
    margin-bottom: 16px;
  }

  .icons-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 8px;
    padding: 8px;
  }

  .icon-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 8px;
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      background-color: var(--el-color-primary-light-9);
      border-color: var(--el-color-primary);
      color: var(--el-color-primary);
    }

    &.active {
      background-color: var(--el-color-primary);
      border-color: var(--el-color-primary);
      color: white;
    }

    .el-icon {
      font-size: 20px;
    }

    .icon-name {
      font-size: 12px;
      text-align: center;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      width: 100%;
    }
  }
}
</style>