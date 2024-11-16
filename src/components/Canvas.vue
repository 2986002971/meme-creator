<template>
    <canvas ref="canvasRef"></canvas>
  </template>
  
  <script setup>
  import { ref, onMounted, watch } from 'vue';
  
  const props = defineProps({
    draw: {
      type: Function,
      required: true
    }
  });
  
  const canvasRef = ref(null);
  
  // 向父组件暴露方法
  const getContext = () => {
    return canvasRef.value?.getContext('2d');
  };
  
  defineExpose({
    getContext
  });
  
  // 监听draw函数的变化并重新绘制
  watch(() => props.draw, (newDraw) => {
    const context = getContext();
    if (context) {
      newDraw(context);
    }
  }, { immediate: true });
  
  // 组件挂载时初始化画布
  onMounted(() => {
    const context = getContext();
    if (context) {
      props.draw(context);
    }
  });
  </script>
  
  <style scoped>
  canvas {
    border: 1px solid #ccc;
  }
  </style>