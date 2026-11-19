<template>
  <div class="index-page">
    <OverviewScreen v-if="activeTab === 'overview'" />

    <!-- TODO: экраны «Репорт» и «Опасности» -->
    <section v-else-if="activeTab === 'report'" class="index-page__stub">Репорт</section>
    <section v-else-if="activeTab === 'dangers'" class="index-page__stub">
      Опасности
      <button type="button" @click="logout">Выйти</button>
    </section>
  </div>
</template>

<script setup>
import OverviewScreen from '~/widgets/overview/ui/OverviewScreen.vue'
import { useActiveTab } from '~/widgets/bottom-nav/model/useActiveTab'
import { useAuth } from '~/entities/user/api/model/useAuth';


const activeTab = useActiveTab()
const { logout } = useAuth();
</script>

<style lang="scss" scoped>
.index-page {
  &__stub {
    padding: 24px;
  }
}
</style>