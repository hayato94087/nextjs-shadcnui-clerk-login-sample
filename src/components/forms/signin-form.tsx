"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { isClerkAPIResponseError, useSignIn } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { authSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";
import { PasswordInput } from "@/components/password-input";
import { useToast } from "../ui/use-toast";

type Inputs = z.infer<typeof authSchema>;

export function SignInForm() {
  const router = useRouter();
  const { isLoaded, signIn, setActive } = useSignIn();
  const [isPending, startTransition] = React.useTransition();
  const { toast } = useToast();

  // react-hook-form
  const form = useForm<Inputs>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(data: Inputs) {
    if (!isLoaded) return;

    startTransition(async () => {
      try {
        const result = await signIn.create({
          identifier: data.email,
          password: data.password,
        });

        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });

          router.push(`${window.location.origin}/`);
        } else {
          /*Investigate why the login hasn't completed */
          console.log(result);
        }
      } catch (err) {
        const unknownError =
          "申し訳ありませんが、何か問題が発生しました。再度お試しください。";

        if(isClerkAPIResponseError(err)){
          if(err.errors[0].code === "form_password_incorrect"){
            toast({ description: "パスワードが正しくありません。再試行するか、別の方法を使用してください。"})
          }else{
            toast({ description: unknownError });
          }
        }
      }
    });
  }

  return (
    <Form {...form}>
      <form
        className="grid gap-4"
        onSubmit={(...args) => void form.handleSubmit(onSubmit)(...args)}
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>メールアドレス</FormLabel>
              <FormControl>
                <Input placeholder="example@gmail.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>パスワード</FormLabel>
              <FormControl>
                <PasswordInput placeholder="**********" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={isPending}>
          {isPending && (
            <Icons.spinner
              className="mr-2 h-4 w-4 animate-spin"
              aria-hidden="true"
            />
          )}
          ログイン
          <span className="sr-only">ログイン</span>
        </Button>
      </form>
    </Form>
  );
}