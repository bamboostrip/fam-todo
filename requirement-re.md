# 需求文档：重复任务逻辑 (Recurrence System)

## 1\. 功能概述

当用户完成一个带有“重复规则”的任务时，系统不应修改原任务的日期，而是应该**将原任务标记为完成**，并立即**生成一个新的任务实例**。新任务的计划日期需根据特定的“追赶逻辑”进行计算。

---

## 2\. 核心交互流程

1.  用户在视图中点击 Checkbox，将 `TodoItem` 标记为 `isCompleted = true`。
2.  系统检测该 `TodoItem` 是否包含有效的 `recurrence` 属性（非 null）。
3.  **如果是重复任务：**
    - **步骤 A (归档):** 更新原任务状态为完成，记录完成时间。
    - **步骤 B (生成):** 立即克隆原任务数据，生成一个新的 `TodoItem`。
    - **步骤 C (计算):** 根据特定算法计算新任务的 `plannedDate`。
    - **步骤 D (入库):** 将新任务插入数据库/Store。
4.  **视图反馈：**
    - 原任务在列表中显示为“已完成”（划线/移到底部）。
    - 新任务立即出现在列表中（如果是今天）或在“计划内”中可见。

---

## 3\. 数据处理规则 (Data Processing Rules)

在生成新任务（`NextTodo`）时，字段的继承与重置规则如下：

| 字段名             | 继承规则       | 逻辑说明                                                                    |
| :----------------- | :------------- | :-------------------------------------------------------------------------- |
| **id**             | **生成新UUID** | 必须是全新的唯一ID。                                                        |
| **content**        | 继承           | 保持任务标题不变。                                                          |
| **recurrence**     | 继承           | 保持重复规则不变（如“daily”）。                                             |
| **isImportant**    | 继承           | 如果原任务是星标任务，新任务也是。                                          |
| **listId**         | 继承           | 留在同一个列表中。                                                          |
| **note**           | 继承           | 备注内容完整保留。                                                          |
| **steps** (子任务) | **重置继承**   | 复制所有子任务的内容，但**强制重置**所有子任务的 `isCompleted` 为 `false`。 |
| **isCompleted**    | **重置**       | 强制设为 `false`。                                                          |
| **myDayDate**      | **强制清空**   | 设为 `null`。**新任务默认不进入“我的一天”**，即使新日期是今天。             |
| **plannedDate**    | **重新计算**   | 见下方“核心算法”。                                                          |
| **createdAt**      | 当前时间       | 记录新任务生成的时刻。                                                      |

---

## 4\. 核心算法：日期计算 (Date Calculation Logic)

这是本功能的逻辑核心。计算遵循 **“基于计划的追赶策略” (Catch-up from Planned Date)**。

### A. 基础原则

1.  **不跳过今天：** 如果任务过期了（昨天或更早），新任务的日期必须是**今天**（让用户补做今天的份）。
2.  **展望未来：** 如果任务今天是正常的（或者就是今天到期），新任务的日期是**下一个周期**。

### B. 算法逻辑流程

1.  **获取基准:** 获取原任务的 `plannedDate` (记为 `OldDate`)。
2.  **初步推演:** 根据 `recurrence` 规则，在 `OldDate` 基础上增加一个周期，得到 `NextDate`。
    - _Daily:_ +1 天
    - _Weekly:_ +1 周
    - _Monthly:_ +1 月
    - _Yearly:_ +1 年
    - _Weekdays:_ 周五/六 -\> 下周一；其他 -\> +1 天
3.  **追赶判定 (While Loop):**
    - 检查 `NextDate` 是否 **严格早于今天** (`NextDate < Today`)。
    - **如果是:** 说明即使加了一次，还是过期的。继续增加一个周期，直到 `NextDate >= Today`。
    - **如果否:** 停止计算。

### C. 典型场景测试用例 (Test Cases)

假设 **今天是 11月30日**，重复规则为 **每天 (Daily)**：

| 场景             | 原任务计划日期  | 计算过程                                                                       | 最终新日期   | 解释                               |
| :--------------- | :-------------- | :----------------------------------------------------------------------------- | :----------- | :--------------------------------- |
| **正常完成**     | 11月30日 (今天) | 11.30 + 1天 = 12.01。<br>12.01 \< 11.30? 否。                                  | **12月01日** | 今天做完，明天继续。               |
| **补卡(昨天)**   | 11月29日 (昨天) | 11.29 + 1天 = 11.30。<br>11.30 \< 11.30? 否。                                  | **11月30日** | 补了昨天的，立刻生成今天的。       |
| **补卡(很久前)** | 11月25日        | 11.25 + 1 = 11.26 (Yes \< Today)<br>...循环累加...<br>11.29 + 1 = 11.30 (No)。 | **11月30日** | 过去欠的账一笔勾销，直接做今天的。 |
| **提前完成**     | 12月05日 (未来) | 12.05 + 1天 = 12.06。<br>12.06 \< 11.30? 否。                                  | **12月06日** | 提前做了未来的，生成再下一次的。   |

---

## 5\. 伪代码参考 (Implementation Reference)

```typescript
import { addDays, addWeeks, addMonths, addYears, isBefore, startOfDay, getDay } from 'date-fns'

/**
 * 计算下一个重复日期的核心函数
 * @param previousDate 上一次的计划日期
 * @param recurrenceRule 重复规则 ('daily' | 'weekly' | 'monthly' | 'yearly' | 'weekdays')
 */
export function calculateNextRecurrenceDate(
  previousDate: Date | string,
  recurrenceRule: string,
): Date {
  // 1. 标准化时间：只比较日期部分，忽略时分秒
  const today = startOfDay(new Date())
  let nextDate = startOfDay(new Date(previousDate))

  // 定义单次增加逻辑
  const addInterval = (date: Date) => {
    switch (recurrenceRule) {
      case 'daily':
        return addDays(date, 1)
      case 'weekly':
        return addWeeks(date, 1)
      case 'monthly':
        return addMonths(date, 1)
      case 'yearly':
        return addYears(date, 1)
      case 'weekdays':
        const day = getDay(date)
        // 周五(5) -> +3天(周一)
        // 周六(6) -> +2天(周一)
        // 其他 -> +1天
        if (day === 5) return addDays(date, 3)
        if (day === 6) return addDays(date, 2)
        return addDays(date, 1)
      default:
        return addDays(date, 1)
    }
  }

  // 2. 至少执行一次增加 (原逻辑: plannedDate + interval)
  nextDate = addInterval(nextDate)

  // 3. 追赶逻辑 (Catch-up Loop)
  // 只要计算出来的日期比今天早 (nextDate < today)，就继续加
  // 注意：如果是今天 (Equal)，则循环停止，返回今天
  while (isBefore(nextDate, today)) {
    nextDate = addInterval(nextDate)
  }

  return nextDate
}
```

## 6\. 开发注意事项

1.  **不要直接修改 Store 里的对象：** 确保使用深拷贝（Deep Copy）或者解构赋值来创建新对象，避免引用污染。
2.  **子任务 ID：** 如果你的子任务有 `id` 属性，生成新任务时，子任务的 ID 也应该**重新生成 UUID**，否则数据库中会有主键冲突。
3.  **空日期处理：** 如果原任务没有 `plannedDate` 但设置了重复（虽然逻辑上矛盾，但需防守），默认以 `createdAt` 或 `Today` 作为基准进行计算。
4.  **重点:** 如果给一个任务添加了重复,那么就会默认给这个任务添加到期时间,如果是每一天 就是今天到期,如果是 工作日,周六添加的,就是对应的那一天的工作日到期,如果是每月每年,或者自定义,因为会默认现在今天添加,所以就是今天截止.如果删除了截止日期,那么就默认也要删除重复.如果删除了重复,截止日期则不必同时删除
