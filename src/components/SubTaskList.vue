<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { Plus, Trash2 } from 'lucide-vue-next'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import type { SubTodo } from '@/store/todos'

defineProps<{
  steps: SubTodo[]
}>()

const emit = defineEmits<{
  add: [content: string]
  toggleComplete: [stepId: string]
  delete: [stepId: string]
  update: [stepId: string, content: string]
  promote: [stepId: string]
}>()

// 新步骤输入
const newStepContent = ref('')

// 编辑状态
const editingStepId = ref<string | null>(null)
const editingContent = ref('')

// 添加新子任务
const handleAddStep = () => {
  if (newStepContent.value.trim()) {
    emit('add', newStepContent.value.trim())
    newStepContent.value = ''
  }
}

// 切换完成状态
const handleToggleComplete = (stepId: string, event: Event) => {
  event.stopPropagation()
  event.preventDefault()
  emit('toggleComplete', stepId)
}

// 删除子任务
const handleDelete = (stepId: string, event: Event) => {
  event.stopPropagation()
  event.preventDefault()
  emit('delete', stepId)
}

// 开始编辑 - 点击文字区域触发
const startEditing = (step: SubTodo, event: Event) => {
  event.stopPropagation()
  editingStepId.value = step.id
  editingContent.value = step.content
  // 使用 nextTick 确保 input 已渲染
  nextTick(() => {
    const input = document.querySelector(`input[data-step-id="${step.id}"]`) as HTMLInputElement
    if (input) {
      input.focus()
      input.select()
    }
  })
}

// 保存编辑
const saveEdit = () => {
  if (editingStepId.value && editingContent.value.trim()) {
    emit('update', editingStepId.value, editingContent.value.trim())
  }
  cancelEdit()
}

// 取消编辑
const cancelEdit = () => {
  editingStepId.value = null
  editingContent.value = ''
}

// 提升为任务
const handlePromote = (stepId: string) => {
  emit('promote', stepId)
}

// 从右键菜单开始编辑
const handleContextMenuEdit = (step: SubTodo) => {
  editingStepId.value = step.id
  editingContent.value = step.content
  nextTick(() => {
    const input = document.querySelector(`input[data-step-id="${step.id}"]`) as HTMLInputElement
    if (input) {
      input.focus()
      input.select()
    }
  })
}
</script>

<template>
  <div class="rounded-lg border border-gray-200 bg-gray-50/50 p-3 space-y-2">
    <!-- 子任务标题 -->
    <div class="text-xs font-medium text-gray-500 px-1">子任务</div>

    <!-- 已有的子任务列表 -->
    <div v-if="steps.length > 0" class="space-y-1">
      <ContextMenu v-for="step in steps" :key="step.id">
        <ContextMenuTrigger as-child>
          <div
            class="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-colors group"
          >
            <!-- 完成状态按钮 -->
            <button
              class="flex-shrink-0 w-4 h-4 rounded-full border-2 transition-all hover:scale-110"
              :class="
                step.isCompleted
                  ? 'bg-blue-500 border-blue-500'
                  : 'border-gray-400 hover:border-blue-500'
              "
              @click="handleToggleComplete(step.id, $event)"
            >
              <svg
                v-if="step.isCompleted"
                class="w-full h-full text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>

            <!-- 内容区域 - 点击直接编辑 -->
            <div class="flex-1 min-w-0 cursor-text" @click="startEditing(step, $event)">
              <!-- 编辑模式 -->
              <input
                v-if="editingStepId === step.id"
                :data-step-id="step.id"
                v-model="editingContent"
                type="text"
                class="w-full text-sm bg-transparent border-none outline-none"
                @keyup.enter="saveEdit"
                @keyup.escape="cancelEdit"
                @blur="saveEdit"
              />
              <!-- 显示模式 -->
              <span
                v-else
                class="text-sm block truncate"
                :class="{ 'line-through text-gray-400': step.isCompleted }"
              >
                {{ step.content }}
              </span>
            </div>

            <!-- 删除按钮 -->
            <button
              class="flex-shrink-0 p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
              title="删除"
              @click="handleDelete(step.id, $event)"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </ContextMenuTrigger>

        <ContextMenuContent class="w-40 z-[102]">
          <ContextMenuItem @click="handleContextMenuEdit(step)">
            <span class="flex items-center gap-2">
              <svg
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              修改
            </span>
          </ContextMenuItem>
          <ContextMenuItem @click="handlePromote(step.id)">
            <span class="flex items-center gap-2">
              <svg
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M12 17V3" />
                <path d="m6 11 6-6 6 6" />
                <path d="M19 21H5" />
              </svg>
              提升为任务
            </span>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>

    <!-- 添加步骤输入框 -->
    <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-colors">
      <Plus class="w-4 h-4 text-gray-400 flex-shrink-0" />
      <input
        v-model="newStepContent"
        type="text"
        placeholder="添加步骤"
        class="flex-1 text-sm bg-transparent border-none outline-none text-gray-600 placeholder-gray-400"
        @keyup.enter="handleAddStep"
      />
    </div>
  </div>
</template>
