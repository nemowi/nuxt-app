<template>
  <div class="index-page">
    <OverviewScreen v-show="activeTab === 'overview'" />
    <Report v-show="activeTab === 'report'" class="index-page__stub"/>
    <DangersScreen v-show="activeTab === 'dangers'" class="index-page__stub">
      <button type="button" @click="logout">Выйти</button>
    </DangersScreen>
  </div>
  
</template>

<script setup>
import OverviewScreen from '~/widgets/overview/ui/OverviewScreen.vue'
import { useActiveTab } from '~/widgets/bottom-nav/model/useActiveTab'
import { useAuth } from '~/entities/user/api/model/useAuth';
import Report from './report.vue';
import DangersScreen from '~/widgets/dangers/ui/DangersScreen.vue';

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