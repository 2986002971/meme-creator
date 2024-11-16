<template>
    <div>
      <Button @click="handleClick" severity="secondary">
        Pick character
      </Button>
  
      <Dialog 
        v-model:visible="isOpen"
        modal 
        :style="{ width: '90vw', maxWidth: '500px' }"
        position="bottom"
      >
        <template #header>
          <div class="picker-search w-full">
            <InputText
              v-model="search"
              placeholder="Search character"
              class="w-full"
            />
          </div>
        </template>
  
        <div class="image-grid-wrapper">
          <div class="grid">
            <div 
              v-for="(char, index) in filteredCharacters" 
              :key="index"
              class="col-4 sm:col-3 md:col-3 lg:col-3"
              @click="selectCharacter(index)"
            >
              <div class="character-item">
                <img 
                  :src="`/img/${char.img}`"
                  :alt="char.name"
                  class="w-full cursor-pointer hover:opacity-80 transition-opacity duration-200"
                />
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  import characters from '../characters.json';
  
  const props = defineProps({
    onSelect: {
      type: Function,
      required: true
    }
  });
  
  const isOpen = ref(false);
  const search = ref('');
  
  // 过滤角色列表
  const filteredCharacters = computed(() => {
    const searchTerm = search.value.toLowerCase();
    return characters.filter(char => 
      searchTerm === char.id ||
      char.name.toLowerCase().includes(searchTerm) ||
      char.character.toLowerCase().includes(searchTerm)
    );
  });
  
  const handleClick = () => {
    isOpen.value = true;
  };
  
  const selectCharacter = (index) => {
    // 获取过滤后角色的实际ID
    const selectedChar = filteredCharacters.value[index];
    // 找到在原始数组中的索引
    const originalIndex = characters.findIndex(char => char.id === selectedChar.id);
    props.onSelect(originalIndex);
    isOpen.value = false;
  };
  </script>
  
  <style scoped>
  .picker-search {
    margin-bottom: 1rem;
  }
  
  .image-grid-wrapper {
    max-height: 450px;
    overflow-y: auto;
  }
  
  .character-item {
    aspect-ratio: 1;
    overflow: hidden;
    border-radius: 4px;
    margin: 4px;
  }
  
  .character-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  :deep(.p-dialog-content) {
    padding: 0 1rem 1rem 1rem;
  }
  </style>