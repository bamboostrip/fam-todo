import { defineConfig, loadEnv, type UserConfig, type PluginOption } from 'vite' // 显式导入 UserConfig 和 PluginOption 类型
import vue from '@vitejs/plugin-vue'
import path from 'node:path' // 导入 path 模块，需要 @types/node
import dayjs from 'dayjs'
import VueRouter from 'unplugin-vue-router/vite' // 1. 导入插件

// Vite 插件
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import ViteRestart from 'vite-plugin-restart'
import { visualizer } from 'rollup-plugin-visualizer'

const tauriDevHost = process.env.TAURI_DEV_HOST // @types/node 安装后，process 将被识别

// https://vitejs.dev/config/
export default defineConfig(async ({ command, mode }): Promise<UserConfig> => {
  // 显式声明返回 Promise<UserConfig>
  console.log('[Vite Config] Command:', command, '| Mode:', mode)

  const envDir = path.resolve(process.cwd(), 'env')
  const env = loadEnv(mode, envDir, '')

  const {
    VITE_APP_PORT,
    VITE_DELETE_CONSOLE,
    VITE_SHOW_SOURCEMAP,
    VITE_APP_PROXY,
    VITE_APP_PROXY_PREFIX,
    VITE_SERVER_BASEURL,
    VITE_APP_TITLE,
    VITE_APP_PUBLIC_BASE,
  } = env

  console.log('[Vite Config] Loaded Env Variables:', env)

  const shouldDeleteConsole = VITE_DELETE_CONSOLE === 'true'
  const shouldShowSourcemap = VITE_SHOW_SOURCEMAP === 'true'
  const enableProxy = VITE_APP_PROXY === 'true'

  // 明确定义插件数组类型
  const vitePlugins: PluginOption[] = [
    VueRouter({
      // 2. 添加插件到 plugins 数组
      // --- 插件选项 (可选) ---
      routesFolder: 'src/pages', // 指定存放页面组件的文件夹，默认为 'src/pages'
      // 你也可以指定多个文件夹: ['src/pages', 'src/features/**/routes']
      dts: './src/types/typed-router.d.ts', // 生成的路由类型声明文件路径
      // extensions: ['.vue', '.md'], // 路由组件的文件扩展名，默认 ['.vue']
      // routeBlockLang: 'json5', // <route>块的语言，默认 'json5'
    }),
    vue(),
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        {
          'unplugin-vue-router/runtime': ['definePage'], // 显式添加
        },
      ],
      resolvers: [ElementPlusResolver()],
      dts: 'src/types/auto-imports.d.ts',
      eslintrc: {
        enabled: true,
        filepath: './.eslintrc-auto-import.json',
        globalsPropValue: true,
      },
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      dts: 'src/types/components.d.ts',
    }),
    ViteRestart({
      restart: ['vite.config.ts', 'env/.env.*'],
    }),
    {
      name: 'inject-build-time',
      // 确保 transformIndexHtml 返回 Vite 期望的类型
      transformIndexHtml(
        html: string,
      ): string | void | { html: string; tags: import('vite').HtmlTagDescriptor[] } {
        if (command === 'build') {
          return html.replace(
            '</body>',
            `  <script>window.BUILD_TIME = "${dayjs().format('YYYY-MM-DD HH:mm:ss')}";</script>\n</body>`,
          )
        }
        return html // 或者 return; / return undefined; 如果没有修改
      },
    },
  ]

  if (mode === 'production') {
    vitePlugins.push(
      visualizer({
        filename: './node_modules/.cache/visualizer/stats.html',
        open: false,
        gzipSize: true,
        brotliSize: true,
      }),
    )
  }

  // 显式定义配置对象的类型为 UserConfig
  const config: UserConfig = {
    base: VITE_APP_PUBLIC_BASE || '/', // <--- 添加这一行，设置基础路径，默认为 '/'
    envDir: 'env',
    plugins: vitePlugins,
    define: {
      __APP_ENV__: JSON.stringify(mode),
      __APP_TITLE__: JSON.stringify(VITE_APP_TITLE || 'My Vue App'),
      // import.meta.env.VITE_XXX 是访问客户端环境变量的标准方式
      // 如果确实需要 process.env 的形式（例如某些第三方库依赖），可以像下面这样定义
      // 但请注意不要暴露敏感信息到客户端
      // 'process.env.VITE_SOME_VAR': JSON.stringify(env.VITE_SOME_VAR),
    },
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), 'src'),
      },
    },
    server: {
      port: Number(VITE_APP_PORT) || 1420,
      strictPort: true,
      host: tauriDevHost || '0.0.0.0',
      hmr: tauriDevHost
        ? {
            protocol: 'ws',
            host: tauriDevHost,
            port: 1421,
          }
        : { overlay: true },
      watch: {
        ignored: ['**/src-tauri/**'],
      },
      proxy:
        enableProxy && VITE_APP_PROXY_PREFIX && VITE_SERVER_BASEURL
          ? {
              [VITE_APP_PROXY_PREFIX]: {
                target: VITE_SERVER_BASEURL,
                changeOrigin: true,
                rewrite: (path) => path.replace(new RegExp(`^${VITE_APP_PROXY_PREFIX}`), ''),
              },
            }
          : undefined,
    },
    build: {
      target: 'modules',
      sourcemap: shouldShowSourcemap,
      minify: mode === 'production' ? 'terser' : 'esbuild',
      terserOptions:
        mode === 'production'
          ? {
              compress: {
                drop_console: shouldDeleteConsole,
                drop_debugger: true,
              },
              format: {
                comments: false,
              },
            }
          : undefined,
    },
    clearScreen: false,
  }

  return config
})
