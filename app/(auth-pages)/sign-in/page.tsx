import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
  return (
    <form className="flex-1 flex flex-col min-w-64">
      <h1 className="text-2xl font-medium text-white mb-2">登录</h1>
      <p className="text-sm text-white/80 mb-6">
        还没有账号？{" "}
        <Link className="text-white font-medium underline hover:text-white/80" href="/sign-up">
          立即注册
        </Link>
      </p>
      <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
        <Label htmlFor="email" className="text-white">邮箱</Label>
        <Input 
          name="email" 
          placeholder="you@example.com" 
          required 
          className="bg-white/20 border-white/30 text-white placeholder-white/50 focus:ring-white/50"
        />
        <div className="flex justify-between items-center">
          <Label htmlFor="password" className="text-white">密码</Label>
          <Link
            className="text-xs text-white/80 underline hover:text-white"
            href="/forgot-password"
          >
            忘记密码？
          </Link>
        </div>
        <Input
          type="password"
          name="password"
          placeholder="请输入密码"
          required
          className="bg-white/20 border-white/30 text-white placeholder-white/50 focus:ring-white/50"
        />
        <SubmitButton pendingText="登录中..." formAction={signInAction}>
          登录
        </SubmitButton>
        <FormMessage message={searchParams} />
      </div>
    </form>
  );
}
