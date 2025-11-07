# Supabase 数据库设置说明

## 创建 Todos 表

### 方法一：使用 Supabase Dashboard（推荐）

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 进入 **SQL Editor**
4. 复制 `migrations/001_create_todos_table.sql` 文件中的内容
5. 粘贴到 SQL Editor 中并执行

### 方法二：使用 Supabase CLI

如果你使用 Supabase CLI 进行本地开发：

```bash
# 应用迁移
supabase db reset
# 或者
supabase migration up
```

## 表结构说明

### todos 表

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | BIGINT | 主键，自动生成 |
| user_id | UUID | 用户ID，关联 auth.users 表 |
| text | TEXT | Todo 内容 |
| completed | BOOLEAN | 是否完成，默认 false |
| image_url | TEXT | 图片附件URL（可选） |
| created_at | TIMESTAMPTZ | 创建时间 |
| updated_at | TIMESTAMPTZ | 更新时间 |

## RLS (Row Level Security) 策略

已启用 RLS，确保数据安全：

- **SELECT**: 用户只能查看自己的 todos
- **INSERT**: 用户只能创建自己的 todos（自动关联 user_id）
- **UPDATE**: 用户只能更新自己的 todos
- **DELETE**: 用户只能删除自己的 todos

所有策略都基于 `auth.uid()` 与 `user_id` 的匹配，确保用户只能操作自己的数据。

## 索引

为了提高查询性能，创建了以下索引：

- `idx_todos_user_id`: 按用户ID查询

## 触发器

- **自动更新 updated_at**: 每次更新记录时自动更新时间戳

## Realtime 功能

已启用 Supabase Realtime 功能，支持多设备实时同步：

- **INSERT**: 当用户添加新的 todo 时，所有设备会自动收到更新
- **UPDATE**: 当用户修改或切换完成状态时，所有设备会自动同步
- **DELETE**: 当用户删除 todo 时，所有设备会自动移除

Realtime 订阅会自动遵循 RLS 策略，确保用户只能接收到自己数据的变化。

### 重要提示

1. 如果已经执行了 `001_create_todos_table.sql`，但需要启用 Realtime，请执行以下 SQL：
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE todos;
   ```

2. 确保在 Supabase Dashboard 中已启用 Realtime 功能（默认已启用）。

