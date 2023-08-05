"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { isClerkAPIResponseError, useSignIn } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { checkEmailSchema } from "@/lib/validations/auth";
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
import { useToast } from "../ui/use-toast";

type Inputs = z.infer<typeof checkEmailSchema>;

export function ResetPasswordForm() {
  const { toast } = useToast();
  const router = useRouter();
  const { isLoaded, signIn } = useSignIn();
  const [isPending, startTransition] = React.useTransition();

  // react-hook-form
  const form = useForm<Inputs>({
    resolver: zodResolver(checkEmailSchema),
    defaultValues: {
      email: "",
    },
  });

  function onSubmit(data: Inputs) {
    if (!isLoaded) return;

    startTransition(async () => {
      try {
        const firstFactor = await signIn.create({
          strategy: "reset_password_email_code",
          identifier: data.email,
        });

        if (firstFactor.status === "needs_first_factor") {
          router.push("/signin/reset-password/step2");
          toast({
            title: "メールを確認してください。",
            description: "6桁の確認コードを送信しました。",
          });
        }
      } catch (err) {
        const unknownError =
          "申し訳ありませんが、何か問題が発生しました。再度お試しください。";

        if (isClerkAPIResponseError(err)) {
          console.log(err.errors[0]);

          if (err.errors[0].code === "form_identifier_not_found") {
            toast({ description: "アカウントが見つかりませんでした。" });
          } else {
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
                <Input placeholder="rodneymullen180@gmail.com" {...field} />
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
          再設定メールを送信
          <span className="sr-only">
            パスワードのリセット確認を続けてください
          </span>
        </Button>
      </form>
    </Form>
  );
}