"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, Circle, Plus, Trash2, Pencil, X, Image as ImageIcon, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";

type Todo = {
  id: number;
  text: string;
  completed: boolean;
  image_url?: string | null;
  created_at?: string;
  updated_at?: string;
};

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [newTodoImage, setNewTodoImage] = useState<File | null>(null);
  const [newTodoImagePreview, setNewTodoImagePreview] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingTodoId, setUploadingTodoId] = useState<number | null>(null);
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const router = useRouter();

  // 加载当前用户的 todos
  const loadTodos = async (userId?: string) => {
    try {
      setIsLoading(true);
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading todos:", error);
        setTodos([]);
      } else {
        setTodos(data || []);
      }
    } catch (err: any) {
      console.error("Unexpected error loading todos:", err);
      setTodos([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    // 监听认证状态变化
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      setIsAuthenticated(!!session?.user);
      
      // 只在 INITIAL_SESSION 事件时加载数据，避免在 SIGNED_IN 时客户端未初始化完成
      if (event === "INITIAL_SESSION" && session?.user) {
        setIsLoading(true);
        await loadTodos(session.user.id);
      } else if (!session?.user) {
        setTodos([]);
        setIsLoading(false);
      }
    });

    // 初始检查：使用 getSession 快速检查
    const checkInitialSession = async () => {
      try {
        // 等待一下，确保 Supabase 客户端初始化完成
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        setIsAuthenticated(!!session?.user);
        
        if (session?.user) {
          setIsLoading(true);
          await loadTodos(session.user.id);
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error checking initial session:", err);
        if (mounted) {
          setIsAuthenticated(false);
          setIsLoading(false);
        }
      }
    };
    
    checkInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 防止重复提交
    if (isAddingTodo) {
      return;
    }

    // 检查用户是否登录
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      router.push("/sign-in");
      return;
    }

    if (!newTodo.trim()) {
      return;
    }

    setIsAddingTodo(true);

    try {
      // 先插入到数据库
      const { data, error } = await supabase
        .from("todos")
        .insert([
          {
            user_id: session.user.id,
            text: newTodo.trim(),
            completed: false,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error adding todo:", error);
        alert(`添加失败: ${error.message || error.code || "未知错误"}\n\n请检查：\n1. 是否已创建 todos 表\n2. RLS 策略是否正确设置\n3. 浏览器控制台查看详细错误`);
        setIsAddingTodo(false);
        return;
      }

      // 如果有图片，上传图片
      if (newTodoImage && data) {
        await uploadImage(data.id, newTodoImage);
        // 重新加载todos以获取最新的图片URL
        await loadTodos(session.user.id);
      } else {
        // 更新本地状态
        setTodos([data, ...todos]);
      }

      // 清空表单
      setNewTodo("");
      setNewTodoImage(null);
      if (newTodoImagePreview) {
        URL.revokeObjectURL(newTodoImagePreview);
      }
      setNewTodoImagePreview(null);
    } catch (err: any) {
      console.error("Error adding todo:", err);
      alert(`添加失败: ${err.message || "未知错误"}`);
    } finally {
      setIsAddingTodo(false);
    }
  };

  // 处理新任务图片选择
  const handleNewTodoImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewTodoImage(file);
      // 创建预览URL
      const previewUrl = URL.createObjectURL(file);
      setNewTodoImagePreview(previewUrl);
    }
  };

  // 删除新任务的图片
  const removeNewTodoImage = () => {
    if (newTodoImagePreview) {
      URL.revokeObjectURL(newTodoImagePreview);
    }
    setNewTodoImage(null);
    setNewTodoImagePreview(null);
  };

  const toggleTodo = async (id: number) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    const newCompleted = !todo.completed;
    
    // 乐观更新UI
    setTodos(todos.map((t) => (t.id === id ? { ...t, completed: newCompleted } : t)));

    // 更新数据库
    const supabase = createClient();
    const { error } = await supabase
      .from("todos")
      .update({ completed: newCompleted })
      .eq("id", id);

    if (error) {
      console.error("Error updating todo:", error);
      // 回滚UI更新
      setTodos(todos.map((t) => (t.id === id ? { ...t, completed: todo.completed } : t)));
      alert("更新失败，请重试");
    }
  };

  const deleteTodo = async (id: number) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    // 如果todo有图片，先删除图片
    if (todo.image_url) {
      await deleteImage(id, todo.image_url);
    }

    // 乐观更新UI
    const originalTodos = todos;
    setTodos(todos.filter((todo) => todo.id !== id));

    // 从数据库删除
    const supabase = createClient();
    const { error } = await supabase.from("todos").delete().eq("id", id);

    if (error) {
      console.error("Error deleting todo:", error);
      // 回滚UI更新
      setTodos(originalTodos);
      alert("删除失败，请重试");
    }
  };

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = async () => {
    if (!editText.trim() || !editingId) {
      return;
    }

    const originalText = todos.find((t) => t.id === editingId)?.text;
    const textToSave = editText.trim();
    const currentEditingId = editingId;
    
    // 乐观更新UI
    setTodos(todos.map((todo) =>
      todo.id === currentEditingId ? { ...todo, text: textToSave } : todo
    ));
    setEditingId(null);
    setEditText("");

    // 更新数据库
    const supabase = createClient();
    const { error } = await supabase
      .from("todos")
      .update({ text: textToSave })
      .eq("id", currentEditingId);

    if (error) {
      console.error("Error updating todo:", error);
      // 回滚UI更新
      setTodos(todos.map((todo) =>
        todo.id === currentEditingId ? { ...todo, text: originalText || "" } : todo
      ));
      setEditingId(currentEditingId);
      setEditText(textToSave);
      alert("更新失败，请重试");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  // 上传图片到 Supabase Storage
  const uploadImage = async (todoId: number, file: File) => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      alert("请先登录");
      return;
    }

    setUploadingTodoId(todoId);

    try {
      // 生成唯一文件名
      const fileExt = file.name.split('.').pop();
      const fileName = `${todoId}_${Date.now()}.${fileExt}`;
      const filePath = `${session.user.id}/${fileName}`;

      // 上传到 Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('my-todo')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("Error uploading image:", uploadError);
        alert(`上传失败: ${uploadError.message}`);
        setUploadingTodoId(null);
        return;
      }

      // 获取公共URL
      const { data: { publicUrl } } = supabase.storage
        .from('my-todo')
        .getPublicUrl(filePath);

      // 更新数据库中的 image_url
      const { error: updateError } = await supabase
        .from("todos")
        .update({ image_url: publicUrl })
        .eq("id", todoId);

      if (updateError) {
        console.error("Error updating image_url:", updateError);
        alert(`保存图片地址失败: ${updateError.message}`);
        // 删除已上传的文件
        await supabase.storage.from('my-todo').remove([filePath]);
      } else {
        // 更新本地状态
        setTodos(todos.map(todo =>
          todo.id === todoId ? { ...todo, image_url: publicUrl } : todo
        ));
      }
    } catch (err: any) {
      console.error("Unexpected error uploading image:", err);
      alert(`上传失败: ${err.message || "未知错误"}`);
    } finally {
      setUploadingTodoId(null);
    }
  };

  // 删除图片
  const deleteImage = async (todoId: number, imageUrl: string) => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) return;

    try {
      // 从完整URL中提取文件路径
      // URL格式: https://xxx.supabase.co/storage/v1/object/public/my-todo/user_id/file_name
      const urlParts = imageUrl.split('/');
      const bucketIndex = urlParts.findIndex(part => part === 'my-todo');
      
      if (bucketIndex === -1 || bucketIndex === urlParts.length - 1) {
        console.error("Invalid image URL format");
        return;
      }

      // 提取 user_id/file_name 部分
      const filePath = urlParts.slice(bucketIndex + 1).join('/');

      // 从Storage删除文件
      const { error: deleteError } = await supabase.storage
        .from('my-todo')
        .remove([filePath]);

      if (deleteError) {
        console.error("Error deleting image:", deleteError);
        // 即使删除文件失败，也继续更新数据库
      }

      // 更新数据库
      const { error: updateError } = await supabase
        .from("todos")
        .update({ image_url: null })
        .eq("id", todoId);

      if (updateError) {
        console.error("Error updating image_url:", updateError);
        alert("删除图片失败，请重试");
      } else {
        // 更新本地状态
        setTodos(todos.map(todo =>
          todo.id === todoId ? { ...todo, image_url: null } : todo
        ));
      }
    } catch (err: any) {
      console.error("Unexpected error deleting image:", err);
      alert(`删除失败: ${err.message || "未知错误"}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 pb-12 px-4 sm:px-6 lg:px-8 -mt-14 pt-24">
      <div className="max-w-md mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-6">
          <div className="flex flex-col items-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4 text-center">
              牛逼Todo
            </h1>
          </div>

          <form onSubmit={addTodo} className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="添加新任务..."
                className="flex-1 px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                disabled={!isAuthenticated}
              />
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleNewTodoImageChange}
                  disabled={!isAuthenticated || !!newTodoImage}
                />
                <div
                  className={cn(
                    "p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors duration-200 text-white",
                    (!isAuthenticated || !!newTodoImage) && "opacity-50 cursor-not-allowed"
                  )}
                  title={newTodoImage ? "已有图片" : "上传图片"}
                >
                  <ImageIcon className="w-6 h-6" />
                </div>
              </label>
              <button
                type="submit"
                disabled={!isAuthenticated || isLoading || isAddingTodo}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors duration-200 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
            {/* 新任务图片预览 */}
            {newTodoImagePreview && (
              <div className="relative mt-2">
                <img
                  src={newTodoImagePreview}
                  alt="预览"
                  className="w-full max-w-xs rounded-lg object-cover border border-white/20"
                />
                <button
                  type="button"
                  onClick={removeNewTodoImage}
                  className="absolute top-2 right-2 p-1 bg-red-500/80 hover:bg-red-600 rounded-full text-white transition-colors"
                  title="删除图片"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </form>

          {isLoading ? (
            <div className="text-center text-white/70 mt-8">
              加载中...
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {todos.map((todo) => (
                  <div
                    key={todo.id}
                    className={cn(
                      "group flex flex-col gap-3 p-3 rounded-lg transition-all duration-300",
                      "bg-white/10 hover:bg-white/20",
                      todo.completed && "opacity-75"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleTodo(todo.id)}
                        className="text-white hover:scale-110 transition-transform duration-200"
                      >
                        {todo.completed ? (
                          <Check className="w-6 h-6" />
                        ) : (
                          <Circle className="w-6 h-6" />
                        )}
                      </button>
                      
                      {editingId === todo.id ? (
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="flex-1 px-3 py-1 rounded bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit();
                              if (e.key === 'Escape') cancelEdit();
                            }}
                          />
                          <button
                            onClick={saveEdit}
                            className="p-1 text-white hover:text-green-300 transition-colors"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1 text-white hover:text-red-300 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <span
                          className={cn(
                            "flex-1 text-white transition-all duration-300",
                            todo.completed && "line-through opacity-75"
                          )}
                        >
                          {todo.text}
                        </span>
                      )}
                      
                      {editingId !== todo.id && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  uploadImage(todo.id, file);
                                }
                              }}
                              disabled={uploadingTodoId === todo.id || !!todo.image_url}
                            />
                            <div
                              className={cn(
                                "p-1 text-white hover:text-purple-300 transition-colors",
                                (uploadingTodoId === todo.id || !!todo.image_url) && "opacity-50 cursor-not-allowed"
                              )}
                              title={todo.image_url ? "已有图片，请先删除" : "上传图片"}
                            >
                              {uploadingTodoId === todo.id ? (
                                <Upload className="w-5 h-5 animate-pulse" />
                              ) : (
                                <ImageIcon className="w-5 h-5" />
                              )}
                            </div>
                          </label>
                          <button
                            onClick={() => startEditing(todo)}
                            className="p-1 text-white hover:text-blue-300 transition-colors"
                          >
                            <Pencil className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => deleteTodo(todo.id)}
                            className="p-1 text-white hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 图片预览 */}
                    {todo.image_url && (
                      <div className="relative ml-9 mt-2">
                        <img
                          src={todo.image_url}
                          alt="Todo附件"
                          className="w-full max-w-xs rounded-lg object-cover border border-white/20"
                          onError={(e) => {
                            console.error("Image load error");
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <button
                          onClick={() => deleteImage(todo.id, todo.image_url!)}
                          className="absolute top-2 right-2 p-1 bg-red-500/80 hover:bg-red-600 rounded-full text-white transition-colors"
                          title="删除图片"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {todos.length === 0 && (
                <div className="text-center text-white/70 mt-8">
                  {isAuthenticated ? "开始计划点什么吧" : "登录后制定Todo"}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
