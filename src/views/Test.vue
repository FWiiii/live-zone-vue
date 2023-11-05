<script setup>
import { ElMessageBox } from 'element-plus'

function open() {
  ElMessageBox.alert('This is a message', 'Title', {
    confirmButtonText: 'OK',
  })
}
</script>

<template>
  <el-button text @click="open">
    Click to open the Message Box
  </el-button>
</template>
