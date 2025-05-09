<!-- src/views/system/role/menu.vue -->
<script setup lang="ts">
import { ref } from "vue";
import { RoleMenuProps } from "./utils/types";

const props = defineProps<RoleMenuProps>();

const menuRef = ref();
const menuIds = ref(props.menuIds);
const roleName = ref(props.roleName);
const menuOptions = ref(props.menuOptions);

defineExpose({
  getMenuIds: () => menuIds.value
});
</script>

<template>
  <el-form label-width="100px">
    <el-form-item label="角色名称">
      <el-input :model-value="roleName" disabled />
    </el-form-item>
    <el-form-item label="菜单权限">
      <el-tree ref="menuRef" :data="menuOptions" show-checkbox node-key="id" :props="{
        label: 'title',
        children: 'children'
      }" :default-checked-keys="menuIds" @check="(_, { checkedKeys }) => {
        menuIds = checkedKeys;
      }" />
    </el-form-item>
  </el-form>
</template>