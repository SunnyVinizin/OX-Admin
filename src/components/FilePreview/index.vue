<template>
  <div>
    <!-- 文件列表展示 -->
    <div v-if="fileList?.length" class="flex flex-wrap gap-4">
      <div v-for="file in fileList" :key="file.url" class="flex items-center gap-2 p-2 border rounded hover:bg-gray-50">
        <!-- 文件图标 -->
        <div class="w-10 h-10 flex items-center justify-center bg-gray-50 rounded">
          <el-icon :size="24" :class="getFileIconColor(file.name)">
            <component :is="getFileIcon(file.name)" />
          </el-icon>
        </div>

        <!-- 文件信息 -->
        <div class="flex flex-col flex-1 min-w-0">
          <span class="text-sm truncate">{{ file.name }}</span>
          <div class="flex gap-2">
            <el-button v-if="canPreview(file.name)" link type="primary" size="small" @click="handlePreview(file)">
              预览
            </el-button>
            <el-button link type="primary" size="small" @click="handleDownload(file)">
              下载
            </el-button>
          </div>
        </div>
      </div>
    </div>
    <el-empty v-else description="暂无附件" :image-size="60" />

    <!-- 预览弹窗 -->
    <el-dialog v-model="previewVisible" width="90%" :destroy-on-close="true" class="preview-dialog" :show-close="false">
      <!-- 自定义头部 -->
      <template #header>
        <div class="flex items-center justify-between w-full">
          <div class="flex items-center gap-2">
            <el-icon :size="20" :class="getFileIconColor(currentFile?.name)">
              <component :is="getFileIcon(currentFile?.name)" />
            </el-icon>
            <span class="text-lg font-medium">{{ currentFile?.name }}</span>
          </div>
          <div class="flex items-center gap-2">
            <el-tooltip content="全屏" placement="bottom">
              <el-button circle @click="toggleFullscreen">
                <el-icon>
                  <FullScreen />
                </el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip content="下载" placement="bottom">
              <el-button circle @click="handleDownload(currentFile)">
                <el-icon>
                  <Download />
                </el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip content="关闭" placement="bottom">
              <el-button circle @click="previewVisible = false">
                <el-icon>
                  <Close />
                </el-icon>
              </el-button>
            </el-tooltip>
          </div>
        </div>
      </template>

      <!-- 预览内容 -->
      <div v-loading="loading" class="preview-container" :class="{ 'is-fullscreen': isFullscreen }">
        <div class="preview-content">
          <!-- Word文档 -->
          <vue-office-docx v-if="isWordFile(currentFile?.name)" :src="getProxyUrl(currentFile?.url)"
            class="office-viewer" @rendered="onRendered" @error="onError" />

          <!-- Excel文档 -->
          <vue-office-excel v-if="isExcelFile(currentFile?.name)" :src="getProxyUrl(currentFile?.url)"
            class="office-viewer" @rendered="onRendered" @error="onError" />

          <!-- PDF文档 -->
          <vue-office-pdf v-if="isPdfFile(currentFile?.name)" :src="getProxyUrl(currentFile?.url)" class="office-viewer"
            @rendered="onRendered" @error="onError" />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import VueOfficeDocx from '@vue-office/docx';
import VueOfficeExcel from '@vue-office/excel';
import VueOfficePdf from '@vue-office/pdf';
import { FullScreen, Download, Close } from '@element-plus/icons-vue';

interface FileItem {
  name: string;
  url: string;
}

const props = defineProps<{
  fileList: FileItem[];
}>();

// 状态管理
const previewVisible = ref(false);
const currentFile = ref<FileItem | null>(null);
const loading = ref(false);
const isFullscreen = ref(false);

// 文件类型判断
const isImageFile = (filename: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);
const isWordFile = (filename: string) => /\.(doc|docx)$/i.test(filename);
const isExcelFile = (filename: string) => /\.(xls|xlsx)$/i.test(filename);
const isPdfFile = (filename: string) => /\.pdf$/i.test(filename);

// 判断文件是否可预览
const canPreview = (filename: string) => {
  return isWordFile(filename) || isExcelFile(filename) || isPdfFile(filename);
};

// 获取文件图标
const getFileIcon = (filename: string) => {
  if (isWordFile(filename)) return 'DocumentWord';
  if (isExcelFile(filename)) return 'DocumentExcel';
  if (isPdfFile(filename)) return 'DocumentPdf';
  return 'Document';
};

// 获取文件图标颜色
const getFileIconColor = (filename: string) => {
  if (isWordFile(filename)) return 'text-blue-600';
  if (isExcelFile(filename)) return 'text-green-600';
  if (isPdfFile(filename)) return 'text-red-600';
  return 'text-gray-600';
};

// 处理预览
const handlePreview = (file: FileItem) => {
  loading.value = true;
  currentFile.value = file;
  previewVisible.value = true;
};

// 处理下载
const handleDownload = (file: FileItem) => {
  if (!file) return;
  window.open(file.url);
};

// 切换全屏
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
};

// 获取代理URL
const getProxyUrl = (url: string) => {
  if (!url) return '';
  if (import.meta.env.DEV) {
    return `/cos${new URL(url).pathname}`;
  }
  return url;
};

// 文档渲染回调
const onRendered = () => {
  loading.value = false;
  ElMessage.success('文档加载完成');
};

const onError = (error: any) => {
  loading.value = false;
  ElMessage.error('文档加载失败：' + error.message);
};
</script>

<style lang="scss" scoped>
.preview-dialog {
  :deep(.el-dialog) {
    margin: 0 !important;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-height: 95vh;
    display: flex;
    flex-direction: column;
  }

  :deep(.el-dialog__header) {
    margin: 0;
    padding: 16px 20px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  :deep(.el-dialog__body) {
    padding: 0;
    flex: 1;
    overflow: hidden;
    height: calc(90vh - 120px); // 设置固定高度
  }
}

.preview-container {
  height: 100%;
  background-color: #f5f5f5;
  position: relative;
  overflow: hidden; // 防止容器本身出现滚动条

  &.is-fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 2000;
    background-color: white;
  }
}

.preview-content {
  height: 100%;
  width: 100%;
  overflow: auto; // 使用 auto 而不是 scroll
  padding: 20px;
  background-color: white;

  // Office 预览组件样式
  .office-viewer {
    height: 100%;
    width: fit-content; // 适应内容宽度
    min-width: 100%; // 最小宽度为容器宽度

    :deep() {

      // Excel 表格特殊处理
      .luckysheet-grid-container {
        width: 100% !important;
      }

      // Word 文档处理
      .document-container {
        min-width: 100%;
        padding: 20px 40px;
        margin: 0 auto;
        background-color: white;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }

      // PDF 处理
      .pdf-container {
        width: 100% !important;
      }

      // 表格内容
      table {
        width: 100%;
        max-width: none; // 移除最大宽度限制
      }
    }
  }

  // 自定义滚动条样式
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px; // 确保横向滚动条显示
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;

    &:hover {
      background: #555;
    }
  }
}

// 加载动画样式
:deep(.el-loading-spinner) {
  .circular {
    width: 42px;
    height: 42px;
  }

  .el-loading-text {
    margin-top: 8px;
    font-size: 14px;
  }
}

// 全屏模式过渡动画
.is-fullscreen {
  transition: all 0.3s ease-in-out;
}
</style>