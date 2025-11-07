import { forgotPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";

export default async function ForgotPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  return (
    <>
      <form className="flex-1 flex flex-col w-full gap-2 [&>input]:mb-6 min-w-64 max-w-64 mx-auto">
        <div>
          <h1 className="text-2xl font-medium text-white mb-2">重置密码</h1>
          <p className="text-sm text-white/80 mb-6">
            已有账号？{" "}
            <Link className="text-white font-medium underline hover:text-white/80" href="/sign-in">
              立即登录
            </Link>
          </p>
        </div>
        <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
          <Label htmlFor="email" className="text-white">邮箱</Label>
          <Input 
            name="email" 
            placeholder="you@example.com" 
            required 
            className="bg-white/20 border-white/30 text-white placeholder-white/50 focus:ring-white/50"
          />
          <SubmitButton formAction={forgotPasswordAction}>
            重置密码
          </SubmitButton>
          <FormMessage message={searchParams} />
        </div>
      </form>
      <SmtpMessage />
    </>
  );
}
