<script lang="ts" setup>
import { getConfig } from "@/config";
const currentYear = new Date().getFullYear()
const TITLE = getConfig("Title");
</script>

<template>
  <footer class="layout-footer text-[rgba(0,0,0,0.6)] dark:text-[rgba(220,220,242,0.8)]">
    Copyright © {{ currentYear }} 林 All Rights Reserved |
    <a class="hover:text-primary" href="https://github.com/pure-admin" target="_blank">
      &nbsp;{{ TITLE }}
    </a>
  </footer>
</template>

<style lang="scss" scoped>
.layout-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0 0 8px;
  font-size: 14px;
}
</style>
