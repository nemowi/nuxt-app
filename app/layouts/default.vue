<template>
  <div>
    <div class="app-layout__content">
      <slot />
    </div>
    <BottomNav v-model="activeTab" />
  </div>
</template>

<script setup>
import BottomNav from '~/widgets/bottom-nav/ui/BottomNav.vue'
import { useActiveTab } from '~/widgets/bottom-nav/model/useActiveTab'

const activeTab = useActiveTab()
</script>

<style lang="scss" scoped>

</style>
