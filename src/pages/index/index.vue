<template>
  <div>
    <h2>常规数据列表 (自动加载)</h2>
    <div v-if="fooListLoading">正在加载列表...</div>
    <div v-else-if="fooListError">加载列表失败: {{ fooListError.message }}</div>
    <ul v-else-if="fooListData">
      <li>{{ fooListData.id }}</li>
    </ul>
    <div v-else>没有数据</div>
    <button @click="handChange">刷新列表</button>

    <hr />

    <h2>根据 ID 获取数据 (手动触发)</h2>
    <div>
      <input v-model="itemName" placeholder="输入 Foo ID" />
      <button @click="handleFetchItemById" :disabled="fooItemLoading">
        {{ fooItemLoading ? '加载中...' : '获取详情' }}
      </button>
    </div>
    <div v-if="fooItemLoading" style="margin-top: 10px">正在加载详情...</div>
    <div v-else-if="fooItemError" style="margin-top: 10px">
      加载详情失败: {{ fooItemError.message }}
    </div>
    <div v-else-if="fooItemData" style="margin-top: 10px">
      <h3>获取到的详情:</h3>
      <pre>{{ fooItemData.id }}</pre>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRequest } from 'alova/client'
import { getFooList, getSingleFoo } from '@/service/index/foo' // 2. 导入你的 API Method
import { ElMessage } from 'element-plus'
// import { definePage } from 'unplugin-vue-router/runtime'

definePage({
  meta: {
    layout: 'default-layout',
    title: '另一个演示页', // 用这个 title 来设置 document.title
    requiresAuth: false, // 是否需要登录
  },
})

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
    ElMessage.error('请输入 name')
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
