-- 如果已经创建了 todos 表，只需要执行这个文件来添加自动设置 user_id 的触发器

-- 创建触发器函数，自动设置 user_id
CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器，在插入时自动设置 user_id
DROP TRIGGER IF EXISTS set_todos_user_id ON todos;
CREATE TRIGGER set_todos_user_id
  BEFORE INSERT ON todos
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id();

