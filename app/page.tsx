"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, Circle, Plus, Trash2, Pencil, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";

type Todo = {
  id: number;
  text: string;
  completed: boolean;
  created_at?: string;
  updated_at?: string;
};

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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

    // 插入到数据库（需要显式设置 user_id）
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
      // 显示详细的错误信息
      alert(`添加失败: ${error.message || error.code || "未知错误"}\n\n请检查：\n1. 是否已创建 todos 表\n2. RLS 策略是否正确设置\n3. 浏览器控制台查看详细错误`);
    } else {
      setTodos([data, ...todos]);
      setNewTodo("");
    }
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
              <button
                type="submit"
                disabled={!isAuthenticated || isLoading}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors duration-200 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
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
                      "group flex items-center gap-3 p-3 rounded-lg transition-all duration-300",
                      "bg-white/10 hover:bg-white/20",
                      todo.completed && "opacity-75"
                    )}
                  >
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
