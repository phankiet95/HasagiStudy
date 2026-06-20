<template>
  <div class="mindmap-tree">
    <!-- Root node -->
    <div class="flex justify-center mb-4">
      <div class="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-base rounded-2xl shadow-md text-center max-w-full">
        <svg class="w-4 h-4 flex-shrink-0 opacity-80" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
        </svg>
        <span class="leading-snug">{{ treeData.name }}</span>
      </div>
    </div>

    <!-- Center connector line to branches -->
    <div class="flex justify-center mb-1">
      <div class="w-0.5 h-4 bg-indigo-200"></div>
    </div>

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
