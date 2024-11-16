<template>
  <div class="info-content">
    <div class="flex flex-column gap-3">
      <div class="text-xl font-bold mb-2">About</div>
      <p>
        This is a tool for creating Project Sekai style stickers. 
        You can add text to character images and download them as PNG files.
      </p>

      <div class="text-xl font-bold mb-2">How to use</div>
      <ol class="list-decimal pl-4 flex flex-column gap-2">
        <li>Select a character image</li>
        <li>Enter your text</li>
        <li>Adjust text position, size, and rotation</li>
        <li>Click "Download" to save your sticker</li>
      </ol>

      <div class="text-xl font-bold mb-2">Credits</div>
      <ul class="list-disc pl-4 flex flex-column gap-2">
        <li>
          Character images are from 
          <a 
            href="https://www.sekaipedia.org/" 
            target="_blank" 
            class="text-primary hover:text-primary-700"
          >
            Sekaipedia
          </a>
        </li>
        <li>
          Font: YurukaStd by 
          <a 
            href="https://twitter.com/R_mikimiki" 
            target="_blank"
            class="text-primary hover:text-primary-700"
          >
            みき
          </a>
        </li>
      </ul>

      <div class="flex justify-content-end">
        <Button 
          label="Close" 
          @click="$emit('close')"
          severity="secondary"
          text
        />
      </div>
    </div>
  </div>
</template>

<script setup>
defineEmits(['close']);
</script>

<style scoped>
.info-content {
  padding: 1.5rem;
}

a {
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style> 