import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="w-full flex-1 flex items-center justify-center gap-2 p-4">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <>
      <form className="flex flex-col min-w-64 max-w-64 mx-auto">
        <h1 className="text-2xl font-medium text-white mb-2">注册</h1>
        <p className="text-sm text-white/80 mb-6">
          已有账号？{" "}
          <Link className="text-white font-medium underline hover:text-white/80" href="/sign-in">
            立即登录
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
          <Label htmlFor="password" className="text-white">密码</Label>
          <Input
            type="password"
            name="password"
            placeholder="请输入密码（至少6位）"
            minLength={6}
            required
            className="bg-white/20 border-white/30 text-white placeholder-white/50 focus:ring-white/50"
          />
          <SubmitButton formAction={signUpAction} pendingText="注册中...">
            注册
          </SubmitButton>
          <FormMessage message={searchParams} />
        </div>
      </form>
      <SmtpMessage />
    </>
  );
}
