<script setup lang="ts">

import { ref, computed, onMounted } from "vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { ElMessage, FormInstance } from "element-plus";
import type { Dict, DictItem, QueryParams } from "./utils/types";
import DictForm from "./dict-form.vue";
import ItemForm from "./item-form.vue";
import Document from "@iconify-icons/ep/document";
import Select from "@iconify-icons/ep/select";
import Collection from "@iconify-icons/ep/collection";
import Delete from "@iconify-icons/ep/delete";
import EditPen from "@iconify-icons/ep/edit-pen";
import AddFill from "@iconify-icons/ri/add-circle-line";
import List from "@iconify-icons/ep/list";
import Search from "@iconify-icons/ep/search";
import { hasAuth } from "@/router/utils";
import {
  getDicts,
  createDict,
  updateDict,
  deleteDict,
  deleteDictItem,
  createDictItem,
  updateDictItem,
  getDictItems
} from "@/api/dict";

// 加载状态
const loading = ref(false);
const itemsLoading = ref(false);

// 数据列表
const dictList = ref<Dict[]>([]);
const dictItems = ref<DictItem[]>([]);
const currentDict = ref<Dict>();

// 查询表单
const dictForm = ref<QueryParams>({
  dictName: "",
  dictType: "",
  page: 1,
  pageSize: 100
});

// 对话框状态
const dictDialog = ref({
  visible: false,
  title: "",
  type: "新增"
});
const itemDialog = ref({
  visible: false,
  title: "",
  type: "新增"
});

// 表单数据和ref
const dictFormRef = ref<FormInstance>();
const itemFormRef = ref<FormInstance>();
const dictFormData = ref<Partial<Dict>>({});
const itemFormData = ref<Partial<DictItem>>({});

// 获取字典类型列表
const getDictList = async () => {
  try {
    loading.value = true;
    const res: any = await getDicts(dictForm.value);
    if (res.success) {
      dictList.value = res.data.list || [];
      // 如果有数据且未选中任何项，则自动选中第一项
      if (dictList.value.length > 0 && !activeDictId.value) {
        const firstDict = dictList.value[0];
        activeDictId.value = firstDict.id;
        handleDictSelect(String(firstDict.id));
      }
    }
  } finally {
    loading.value = false;
  }
};

// 获取字典项列表
const getDictItemList = async (dictId: number) => {
  try {
    itemsLoading.value = true;
    const res: any = await getDictItems(dictId);
    if (res.success) {
      dictItems.value = res.data || [];
    }
  } finally {
    itemsLoading.value = false;
  }
};

// 搜索
const onSearch = () => {
  getDictList();
};

// 重置表单
const resetForm = () => {
  dictForm.value = {
    dictName: "",
    dictType: "",
    page: 1,
    pageSize: 100
  };
  getDictList();
};

// 打开字典类型对话框
const openDictDialog = (type: string = "新增", row?: Dict) => {
  dictDialog.value.type = type;
  dictDialog.value.title = `${type}字典类型`;
  dictFormData.value = row ? { ...row } : {
    dictName: "",
    dictType: "",
    status: 1,
    remark: ""
  };
  dictDialog.value.visible = true;
};

// 打开字典项对话框
const openItemDialog = (type: string = "新增", row?: DictItem) => {
  if (!currentDict.value) {
    ElMessage.warning("请先选择字典类型");
    return;
  }
  itemDialog.value.type = type;
  itemDialog.value.title = `${type}字典项`;
  itemDialog.value.visible = true;
  itemFormData.value = row
    ? { ...row }
    : { dictId: currentDict.value.id, sort: 0, status: 1 };
};

// 提交字典类型表单
const submitDictForm = async () => {

  if (!dictFormRef.value) return;

  try {
    await dictFormRef.value.validate();
    if (dictFormData.value.id) {
      await updateDict(dictFormData.value.id, dictFormData.value);
    } else {
      await createDict(dictFormData.value);
    }
    ElMessage.success(`${dictDialog.value.type}成功`);
    getDictList();
    dictDialog.value.visible = false;
  } catch { }
};

// 提交字典项表单
const submitItemForm = async () => {
  if (!itemFormRef.value) return;

  try {
    await itemFormRef.value.validate();
    if (itemFormData.value.id) {
      await updateDictItem(
        currentDict.value.id,
        itemFormData.value.id,
        itemFormData.value
      );
    } else {
      await createDictItem(currentDict.value.id, itemFormData.value);
    }
    ElMessage.success(`${itemDialog.value.type}成功`);
    getDictItemList(currentDict.value.id);
    itemDialog.value.visible = false;
  } catch { }
};

// 删除字典类型
const handleDeleteDict = async (row: Dict) => {
  try {
    await deleteDict(row.id);
    ElMessage.success("删除成功");
    getDictList();
    if (currentDict.value?.id === row.id) {
      currentDict.value = undefined;
      dictItems.value = [];
    }
  } catch { }
};

// 删除字典项
const handleDeleteItem = async (row: DictItem) => {
  if (!currentDict.value) return;
  try {
    await deleteDictItem(currentDict.value.id, row.id);
    ElMessage.success("删除成功");
    getDictItemList(currentDict.value.id);
  } catch { }
};

// 选择字典类型
const handleDictSelect = async (index: string) => {
  const dict = dictList.value.find(d => d.id === Number(index));
  if (dict) {
    currentDict.value = dict;
    await getDictItemList(dict.id);
  }
};

// 当前选中的字典类型
const activeDictId = ref<number>();

// 计算当前字典类型名称
const currentDictName = computed(() => {
  return currentDict.value?.dictName || "请选择字典类型";
});

onMounted(() => {
  getDictList();
});
</script>

<template>
  <div>
    <div class="flex h-[calc(100vh-100px)]">
      <!-- 左侧字典类型列表 -->
      <div class="w-[320px]flex flex-col">
        <!-- 左侧头部 -->
        <div class="p-5">
          <div class="flex justify-between items-center mb-6">
            <div class="flex items-center">
              <el-icon class="mr-2 text-primary text-xl">
                <component :is="useRenderIcon(List)" />
              </el-icon>
              <span class="text-lg font-medium">字典类型管理</span>
            </div>
            <el-button v-if="hasAuth('system:dict:add')" type="primary" :icon="useRenderIcon(AddFill)"
              @click="openDictDialog()">
              新增类型
            </el-button>
          </div>

          <!-- 搜索区域 -->
          <el-card shadow="never">
            <div class="space-y-4">
              <el-input v-model="dictForm.dictName" placeholder="请输入字典名称" clearable :prefix-icon="useRenderIcon(Search)"
                @keyup.enter="onSearch" />
              <el-input v-model="dictForm.dictType" placeholder="请输入字典类型" clearable :prefix-icon="useRenderIcon(Search)"
                @keyup.enter="onSearch" />
              <div class="flex justify-end space-x-2">
                <el-button plain @click="resetForm">
                  <el-icon class="mr-1">
                    <Refresh />
                  </el-icon>重置
                </el-button>
                <el-button type="primary" :icon="useRenderIcon(Search)" @click="onSearch">搜索
                </el-button>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 左侧列表 -->
        <div class="flex-1 overflow-y-auto px-5">
          <el-scrollbar>
            <template v-if="dictList.length > 0">
              <el-menu :default-active="String(activeDictId)" background-color="#ffffff" text-color="#303133"
                active-text-color="#409EFF" @select="handleDictSelect">
                <el-menu-item v-for="dict in dictList" :key="dict.id" :index="String(dict.id)"
                  class="group !h-auto !py-3">
                  <div class="flex justify-between items-center w-full">
                    <div class="flex items-center">
                      <el-icon v-if="hasAuth('system:dict:edit')" class="mr-2">
                        <component :is="useRenderIcon(List)" />
                      </el-icon>
                      <div class="flex flex-col">
                        <span class="font-medium">{{ dict.dictName }}</span>
                        <span class="text-xs text-gray-500">{{ dict.dictType }}</span>
                      </div>
                    </div>
                    <div class="hidden group-hover:flex items-center">
                      <el-button v-if="hasAuth('system:dict:edit')" link type="primary" :icon="useRenderIcon(EditPen)"
                        @click.stop="openDictDialog('修改', dict)" />
                      <el-popconfirm :title="`是否确认删除字典类型【${dict.dictName}】?`" @confirm="handleDeleteDict(dict)">
                        <template #reference>
                          <el-button v-if="hasAuth('system:dict:delete')" link type="danger"
                            :icon="useRenderIcon(Delete)" @click.stop />
                        </template>
                      </el-popconfirm>
                    </div>
                  </div>
                </el-menu-item>
              </el-menu>
            </template>
            <el-empty v-else description="暂无字典类型数据" :image-size="120">
              <template #image>
                <el-icon class="text-gray-400" :size="60">
                  <Document />
                </el-icon>
              </template>
              <template #description>
                <p class="text-gray-400 mb-4">暂无字典类型数据</p>
                <el-button v-if="hasAuth('system:dict:add')" type="primary" :icon="useRenderIcon(AddFill)"
                  @click="openDictDialog()">
                  新增字典类型
                </el-button>
              </template>
            </el-empty>
          </el-scrollbar>
        </div>
      </div>

      <el-divider direction="vertical" class="!h-[calc(100vh-200px)]" />

      <!-- 右侧字典项列表 -->
      <div class="flex-1 flex flex-col">
        <div class="p-5">
          <div class="flex justify-between items-center">
            <div class="flex items-center">
              <el-icon class="mr-2 text-primary text-xl">
                <component :is="useRenderIcon(List)" />
              </el-icon>
              <span class="text-lg font-medium">{{ currentDictName }}</span>
            </div>
            <el-button v-if="hasAuth('system:dictItem:add') && currentDict" type="primary"
              :icon="useRenderIcon(AddFill)" @click="openItemDialog()">
              新增字典项
            </el-button>
          </div>
        </div>

        <div class="flex-1 p-5 overflow-y-auto">
          <el-scrollbar>
            <template v-if="currentDict">
              <div v-if="dictItems.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <el-card v-for="item in dictItems" :key="item.id" shadow="never"
                  class="hover:shadow-md transition-shadow duration-300">
                  <template #header>
                    <div class="flex justify-between items-center">
                      <span class="font-medium text-base">{{ item.label }}</span>
                      <el-space>
                        <el-button v-if="hasAuth('system:dictItem:edit')" link type="primary"
                          :icon="useRenderIcon(EditPen)" @click="openItemDialog('修改', item)">
                          修改
                        </el-button>
                        <el-popconfirm :title="`是否确认删除字典项【${item.label}】?`" @confirm="handleDeleteItem(item)">
                          <template #reference>
                            <el-button v-if="hasAuth('system:dictItem:delete')" link type="danger"
                              :icon="useRenderIcon(Delete)">
                              删除
                            </el-button>
                          </template>
                        </el-popconfirm>
                      </el-space>
                    </div>
                  </template>

                  <div class="space-y-3">
                    <div class="flex items-center">
                      <el-icon class="mr-1.5">
                        <component :is="useRenderIcon(Document)" />
                      </el-icon>
                      <span class="mr-2 text-gray-600">字典值：</span>
                      <el-tag size="small" type="info" effect="plain">{{ item.value }}</el-tag>
                    </div>

                    <div class="flex items-center">
                      <el-icon class="mr-1.5">
                        <component :is="useRenderIcon(Select)" />
                      </el-icon>
                      <span class="mr-2 text-gray-600">状态：</span>
                      <el-tag :type="item.status === 1 ? 'success' : 'danger'" size="small">
                        {{ item.status === 1 ? '启用' : '禁用' }}
                      </el-tag>
                    </div>
                    <div v-if="item.remark" class="text-gray-600 text-sm border-t border-gray-100 pt-3 mt-3">
                      <p class="line-clamp-2">{{ item.remark }}</p>
                    </div>
                  </div>
                </el-card>
              </div>
              <el-empty v-else description="暂无字典项数据" :image-size="120">
                <template #image>
                  <el-icon class="text-gray-600" :size="60">
                    <component :is="useRenderIcon(Collection)" />
                  </el-icon>
                </template>
                <template #description>
                  <p class="text-gray-600 mb-4">当前字典类型暂无数据项</p>
                </template>
              </el-empty>
            </template>
            <el-empty v-else description="请选择字典类型" :image-size="120">
              <template #image>
                <el-icon class="text-gray-600" :size="60">
                  <component :is="useRenderIcon(Select)" />
                </el-icon>
              </template>
              <template #description>
                <p class="text-gray-600">请先选择左侧的字典类型</p>
              </template>
            </el-empty>
          </el-scrollbar>
        </div>
      </div>

      <!-- 字典类型对话框 -->
      <el-dialog v-model="dictDialog.visible" :title="dictDialog.title" width="700px" :close-on-click-modal="false"
        destroy-on-close>
        <dict-form ref="dictFormRef" :form-inline="dictFormData as any" />
        <template #footer>
          <el-button @click="dictDialog.visible = false">取 消</el-button>
          <el-button type="primary" @click="submitDictForm">确 定</el-button>
        </template>
      </el-dialog>

      <!-- 字典项对话框 -->
      <el-dialog v-model="itemDialog.visible" :title="itemDialog.title" width="700px" :close-on-click-modal="false"
        destroy-on-close>
        <item-form ref="itemFormRef" :form-inline="itemFormData as any" />
        <template #footer>
          <el-button @click="itemDialog.visible = false">取 消</el-button>
          <el-button type="primary" @click="submitItemForm">确 定</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-card) {
  border: 1px solid #e5e7eb;

  .el-card__header {
    padding: 12px 16px;
    border-bottom: 1px solid #e5e7eb;
  }

  .el-card__body {
    padding: 16px;
  }
}

:deep(.el-button--link) {
  padding: 4px 8px;
  height: auto;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

:deep(.el-menu-item) {
  white-space: normal;
  height: auto !important;
  min-height: 56px;
  padding: 12px 16px !important;
}
</style>