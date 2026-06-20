<template>
  <div class="mindmap-tree">

    <!-- Branches -->
    <div class="space-y-2">
      <div
        v-for="(branch, idx) in treeData.children"
        :key="idx"
        class="rounded-2xl overflow-hidden border"
        :style="{ borderColor: branchColors[idx % branchColors.length] + '40' }"
      >
        <!-- Branch header -->
        <button
          @click="toggleBranch(idx)"
          class="w-full flex items-center gap-3 px-4 py-3.5 text-left active:opacity-80 transition-opacity"
          :style="{ backgroundColor: branchColors[idx % branchColors.length] + '12' }"
        >
          <!-- Color dot -->
          <span
            class="w-3 h-3 rounded-full flex-shrink-0"
            :style="{ backgroundColor: branchColors[idx % branchColors.length] }"
          ></span>
          <!-- Branch name -->
          <span
            class="flex-1 text-sm font-bold leading-snug"
            :style="{ color: branchColors[idx % branchColors.length] }"
          >{{ branch.name }}</span>
          <!-- Count badge -->
          <span
            v-if="branch.children?.length"
            class="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 mr-1"
            :style="{ backgroundColor: branchColors[idx % branchColors.length] + '20', color: branchColors[idx % branchColors.length] }"
          >{{ branch.children.length }}</span>
          <!-- Chevron -->
          <svg
            class="w-4 h-4 flex-shrink-0 transition-transform duration-200"
            :style="{ color: branchColors[idx % branchColors.length], transform: openBranches.has(idx) ? 'rotate(180deg)' : 'rotate(0deg)' }"
            fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <!-- Branch leaves -->
        <div v-if="openBranches.has(idx)" class="px-4 pb-3 pt-1 space-y-1">
          <template v-for="(leaf, lIdx) in branch.children" :key="lIdx">
            <!-- Leaf row -->
            <div class="flex items-start gap-2.5 py-1.5">
              <span
                class="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                :style="{ backgroundColor: branchColors[idx % branchColors.length] }"
              ></span>
              <span class="text-sm text-gray-700 leading-snug flex-1">{{ leaf.name }}</span>
            </div>
            <!-- Sub-leaves (level 4) -->
            <div v-if="leaf.children?.length" class="ml-4 space-y-0.5 mb-1">
              <div v-for="(sub, sIdx) in leaf.children" :key="sIdx" class="flex items-start gap-2 py-1">
                <span class="mt-1.5 w-1 h-1 rounded-full flex-shrink-0 bg-gray-300"></span>
                <span class="text-xs text-gray-500 leading-snug">{{ sub.name }}</span>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  treeData: { type: Object, required: true },
})

const branchColors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6']

// open first 3 branches by default
const openBranches = ref(new Set([0, 1, 2]))

const toggleBranch = (idx) => {
  const s = new Set(openBranches.value)
  s.has(idx) ? s.delete(idx) : s.add(idx)
  openBranches.value = s
}
</script>
