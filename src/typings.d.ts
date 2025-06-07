// 全局要用的类型放到这里
declare global {
  type IResData<T> = {
    code: number
    msg: string
    data: T
  }

  type IUserInfo = {
    username?: string
    avatar?: string
    token?: string
    nikeName?: string
  }
}

export {} // 防止模块污染
