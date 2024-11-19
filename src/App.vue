<template>
  <div class="app">
    <Toast />
    
    <Dialog v-model:visible="infoOpen" modal header="Info" :style="{ width: '50vw' }">
      <Info @close="handleClose" />
    </Dialog>

    <div class="flex flex-column gap-4">
      <div class="layout-container">
        <div class="canvas-container flex flex-column gap-4">
          <div class="canvas-wrapper flex gap-4">
            <Canvas ref="mainCanvasRef" :draw="draw" />
            <Slider
              v-model="position.y"
              :min="0"
              :max="256"
              orientation="vertical"
              class="h-64"
            />
          </div>
          <Slider
            v-model="position.x"
            :min="0"
            :max="296"
            class="w-full"
          />
        </div>
        
        <div class="controls flex flex-column gap-4">
          <div class="settings">
            <div class="field">
              <label>Rotate:</label>
              <Slider 
                v-model="rotate" 
                :min="-10" 
                :max="10" 
                :step="0.2"
                class="w-full"
              />
            </div>

            <div class="field">
              <label>Font size:</label>
              <Slider 
                v-model="fontSize" 
                :min="10" 
                :max="100"
                class="w-full"
              />
            </div>
          </div>

          <div class="text-input">
            <InputTextarea
              v-model="text"
              :autoResize="true"
              rows="3"
              placeholder="Enter text..."
            />
          </div>

          <Picker @select="setCharacter" />

          <div class="flex gap-2">
            <Button label="Download" icon="pi pi-download" @click="download" />
          </div>
        </div>
      </div>

      <div class="footer">
        <Button label="Info" text @click="handleClickOpen" />
      </div>
    </div>
  </div>
</template>
<script setup>
import Canvas from './components/Canvas.vue'
import Picker from './components/Picker.vue'
import Info from './components/Info.vue'
import { ref, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import characters from './characters.json';
import { writeFile, BaseDirectory } from '@tauri-apps/plugin-fs';
import { downloadDir } from '@tauri-apps/api/path';

// 状态管理
const toast = useToast();
const infoOpen = ref(false);
const character = ref(49);
const text = ref(characters[character.value].defaultText.text);
const position = ref({
  x: characters[character.value].defaultText.x,
  y: characters[character.value].defaultText.y,
});
const fontSize = ref(characters[character.value].defaultText.s);
const rotate = ref(characters[character.value].defaultText.r);
const loaded = ref(false);

// 图片加载
const img = new Image();
const loadImage = () => {
  loaded.value = false;
  return new Promise((resolve) => {
    img.onload = () => {
      loaded.value = true;
      if (mainCanvasRef.value) {
        draw(mainCanvasRef.value.getContext('2d'));
      }
      resolve();
    };

    img.onerror = (e) => {
      toast.add({ 
        severity: 'error', 
        summary: '错误', 
        detail: '图片加载失败', 
        life: 3000 
      });
      resolve();
    };

    img.src = `/img/${characters[character.value].img}`;
  });
};

// 修改 Canvas 引用的名称，避免与子组件冲突
const mainCanvasRef = ref(null);

// 初始加载
onMounted(async () => {
  await loadImage();
});

// 监听角色变化
watch(character, async (newVal) => {
  text.value = characters[newVal].defaultText.text;
  position.value = {
    x: characters[newVal].defaultText.x,
    y: 256 - characters[newVal].defaultText.y,
  };
  rotate.value = characters[newVal].defaultText.r;
  fontSize.value = characters[newVal].defaultText.s;
  await loadImage();
});

// Canvas绘制函数
const draw = (ctx) => {
  if (!loaded.value || !img.src) return;

  ctx.canvas.width = 296;
  ctx.canvas.height = 256;

  try {
    // 1. 绘制背景图片
    drawBackground(ctx);
    // 2. 绘制文字
    drawText(ctx);
  } catch (error) {
    toast.add({ 
      severity: 'error', 
      summary: '错误', 
      detail: '绘制失败', 
      life: 3000 
    });
  }
};

// 绘制背景图片
const drawBackground = (ctx) => {
  const hRatio = ctx.canvas.width / img.width;
  const vRatio = ctx.canvas.height / img.height;
  const ratio = Math.min(hRatio, vRatio);
  const centerShift_x = (ctx.canvas.width - img.width * ratio) / 2;
  const centerShift_y = (ctx.canvas.height - img.height * ratio) / 2;
  
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.drawImage(
    img,
    0,
    0,
    img.width,
    img.height,
    centerShift_x,
    centerShift_y,
    img.width * ratio,
    img.height * ratio
  );
};

// 绘制文字
const drawText = (ctx) => {
  ctx.font = `${fontSize.value}px SSFangTangTi`;
  ctx.lineWidth = 9;
  ctx.save();

  ctx.translate(position.value.x, 256 - position.value.y);
  ctx.rotate(rotate.value / 10);
  ctx.textAlign = "center";
  ctx.strokeStyle = "white";
  ctx.fillStyle = characters[character.value].color;

  const lines = text.value.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const yOffset = i * fontSize.value;
    ctx.strokeText(lines[i], 0, yOffset);
    ctx.fillText(lines[i], 0, yOffset);
  }
  
  ctx.restore();
};

// 方法
const handleClickOpen = () => {
  infoOpen.value = true;
};

const handleClose = () => {
  infoOpen.value = false;
};

const setCharacter = (newCharacter) => {
  character.value = newCharacter;
};

// 下载功能
const download = async () => {
  try {
    const canvas = mainCanvasRef.value.getContext('2d').canvas;
    const dataUrl = canvas.toDataURL('image/png');
    const blobData = dataURLtoBlob(dataUrl);
    
    // 转换 Blob 为 Uint8Array
    const arrayBuffer = await blobData.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // 获取下载目录路径
    const savePath = await downloadDir();
    const fileName = `${characters[character.value].name}.png`;
    
    console.log('准备保存文件:', fileName); // 调试日志
    
    // 使用 writeFile 保存文件
    await writeFile(fileName, uint8Array, {
      baseDir: BaseDirectory.Download // 使用系统下载目录
    });

    toast.add({ 
      severity: 'success', 
      summary: '成功', 
      detail: `文件已保存到: ${savePath}${fileName}`, 
      life: 5000  // 增加显示时间
    });
  } catch (error) {
    // 改进错误处理
    console.error('保存失败:', error); // 在控制台打印完整错误
    const errorMessage = error instanceof Error 
      ? error.message 
      : typeof error === 'string' 
        ? error 
        : '未知错误';
        
    toast.add({ 
      severity: 'error', 
      summary: '错误', 
      detail: `保存失败: ${errorMessage}`, 
      life: 3000 
    });
  }
};

// 辅助函数：将 dataURL 转换为 Blob
const dataURLtoBlob = (dataURL) => {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

// 重绘函数
const redraw = () => {
  if (mainCanvasRef.value) {
    draw(mainCanvasRef.value.getContext('2d'));
  }
};

// 监听所有会触发重绘的响应式数据
watch([text, fontSize, rotate], redraw);
watch(position, redraw, { deep: true });
</script>

<style scoped>
.app {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.canvas-container {
  position: relative;
}

.canvas-wrapper {
  position: relative;
  display: flex;
}

.settings {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field label {
  font-weight: 500;
}

.footer {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

canvas {
  border: 1px solid #ccc;
}

@font-face {
  font-family: 'SSFangTangTi';
  src: url('../src-tauri/fonts/ShangShouFangTangTi.ttf') format('truetype');
}

.layout-container {
  display: flex;
  gap: 1rem;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .app {
    padding: 1rem;
  }

  .layout-container {
    flex-direction: column;
  }

  .canvas-container {
    width: 100%;
  }

  .controls {
    width: 100%;
    padding-top: 1rem;
  }

  /* 确保画布和滑块在移动端也能正确显示 */
  .canvas-wrapper {
    width: 100%;
    max-width: 100%;
    overflow-x: hidden;
  }

  canvas {
    max-width: calc(100% - 2rem); /* 留出右侧滑块的空间 */
    height: auto;
  }
}
</style>

