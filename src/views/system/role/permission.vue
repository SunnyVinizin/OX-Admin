<script setup lang="ts">
import {ref} from "vue";
import {RolePermissionProps} from "./utils/types";

interface Props {
  id?: number;
  roleName: string;
  permissionIds: number[];
  treeData: any[];
}

const props = defineProps<Props>();

const permissionRef = ref();
const permissionIds = ref(props.permissionIds);
const roleName = ref(props.roleName);
const treeData = ref(props.treeData);

// 处理树形数据,将permissions作为children节点
function processTreeData(data: any[]): any[] {
  return data.map(item => {
    const node = {...item};

    // 如果有权限数据,将权限数据转换为子节点
    if (node.permissions && node.permissions.length > 0) {
      node.children = [
        ...(node.children || []),
        ...node.permissions.map(p => ({
          ...p,
          title: p.permissionName, // 显示权限名称
          isPermission: true // 标记为权限节点
        }))
      ];
    }

    // 递归处理子节点
    if (node.children) {
      node.children = processTreeData(node.children);
    }

    return node;
  });
}

// 转换后的树形数据
const processedTreeData = ref(processTreeData(props.treeData));

const treeProps = {
  label: (data: any) => data.title || data.permissionName,
  children: "children"
} as const;

defineExpose({
  getPermissionIds: () => {
    // 只获取权限节点的ID
    const checkedNodes = permissionRef.value.getCheckedNodes();
    return checkedNodes.filter(node => node.isPermission).map(node => node.id);
  }
});
</script>

<template>
  <el-form label-width="100px">
    <el-form-item label="角色名称">
      <el-input :model-value="roleName" disabled />
    </el-form-item>
    <el-form-item label="权限分配">
      <el-tree
        ref="permissionRef"
        :data="processedTreeData"
        show-checkbox
        node-key="id"
        :props="treeProps"
        :default-checked-keys="permissionIds"
        @check="
          (_, {checkedKeys}) => {
            permissionIds = checkedKeys as number[];
          }
        "
      />
    </el-form-item>
  </el-form>
</template>

<style scoped>
:deep(.el-tree-node__content) {
  height: 32px;
}
</style>
