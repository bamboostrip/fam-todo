<route lang="json5">
{
  name: 'home',
  meta: {
    requiresAuth: true,
  },
  layout: 'other',
}
</route>
<template>
  <div class="px-4 py-4">
    <div>
      <div>我的一天</div>
      <div>{{ formattedDate }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRequest } from 'alova/client'
import { getFooList, getSingleFoo } from '@/service/index/foo' // 2. 导入你的 API Method
import { toast } from 'vue-sonner'
import { useRouter } from 'vue-router'
import { v4 as uuidv4 } from 'uuid'
import { db } from '@/utils/db'

const router = useRouter()

// 当前时间 展示 X月XX日,星期X
const currentDate = ref(new Date())
const formattedDate = ref('')
const formatDate = (date: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }
  return date.toLocaleDateString('zh-CN', options)
}
formattedDate.value = formatDate(currentDate.value)

async function addNewTodo(title: string, listId: string) {
  const newTodo = {
    // 关键：在这里手动生成并提供 UUID
    id: uuidv4(),
    title: title,
    listId: listId,
    isDone: false,
    createdAt: new Date(),
    completedAt: null,
    isImportant: false,
    myDay: null,
    dueDate: null,
    recurrenceRule: null,
  }

  try {
    // 使用 add() 方法将新对象存入数据库
    await db.todos.add(newTodo)
    console.log(`Todo "${title}" added successfully!`)
  } catch (error) {
    console.error('Failed to add todo:', error)
  }
}

// 跳转到login
const goLogin = () => {
  router.push('/login')
}

// --- 示例1: 获取列表，组件挂载时自动执行 ---
const {
  loading: fooListLoading,
  data: fooListData,
  error: fooListError,
  send: runGetFooList, // send 是执行函数，可以重命名为 run
} = useRequest(
  () => getFooList(), // 传入一个返回 Method 实例的函数
  {
    immediate: true, // 自动执行
    initialData: { id: '123412341' }, // 可选：给 fooListData 设置一个初始值
  },
)

// --- 示例2: 根据 ID 获取单项，手动触发 ---
const itemName = ref('')
const {
  loading: fooItemLoading,
  data: fooItemData,
  error: fooItemError,
  send: runGetFooItemById, // 这个 send 函数现在需要参数
} = useRequest(
  // 这个函数会在调用 runGetFooItemById(id) 时执行，并接收 id 参数
  (name: string) => getSingleFoo(name),
  {
    immediate: false, // 不自动执行，等待手动调用 runGetFooItemById
  },
)

const handleFetchItemById = async () => {
  if (!itemName.value) {
    toast.error('请输入 name')
    return
  }
  // 调用 runGetFooItemById 时传入参数，这个参数会传给 useRequest 的第一个参数 (函数)
  // runGetFooItemById(itemId.value); // 这样也可以
  // 如果你想在调用后做些事情，可以 await 它
  const result = await runGetFooItemById(itemName.value)
  if (result) {
    console.log('手动获取成功:', result)
  } else if (fooItemError.value) {
    console.error('手动获取失败:', fooItemError.value.message)
  }
}

const handChange = () => {
  runGetFooList()
  console.log('fooListData:', fooListData.value)
}

// --- 同样的方式可以用于上传和下载 ---
// 例如上传 (假设 uploadMyFileAPI 在 @/api/fileService.ts 中定义):
// import { uploadMyFileAPI } from '@/api/fileService';
// const { loading: uploadLoading, error: uploadError, send: runUpload } = useRequest(
//   (file: File) => uploadMyFileAPI(file), // uploadMyFileAPI 接收 File 对象并返回 Method 实例
//   { immediate: false }
// );
// const onFileSelected = (event) => {
//   const file = event.target.files[0];
//   if (file) {
//     runUpload(file);
//   }
// }
</script>

<style lang="scss">
// 注意你写的是 sass，如果是 scss 可能需要 scoped 等
// 你的样式
hr {
  margin: 20px 0;
}
input {
  margin-right: 10px;
}
</style>
