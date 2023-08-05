"use client"

import * as React from "react"
import { isClerkAPIResponseError, useSignIn } from "@clerk/nextjs"
import { type OAuthStrategy } from "@clerk/types"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { useToast } from "@/components/ui/use-toast"

// 認証可能なプロバイダーの一覧
const oauthProviders = [
  { name: "Google", strategy: "oauth_google", icon: "google" },
  // { name: "Facebook", strategy: "oauth_facebook", icon: "facebook" },
  // { name: "Discord", strategy: "oauth_discord", icon: "discord" },
] satisfies {
  name: string
  icon: keyof typeof Icons
  strategy: OAuthStrategy
}[]


export function OAuthSignIn() {
  const [isLoading, setIsLoading] = React.useState<OAuthStrategy | null>(null)
  const { signIn, isLoaded: signInLoaded } = useSignIn()
  const { toast } = useToast()

  async function oauthSignIn(provider: OAuthStrategy) {
    if (!signInLoaded) return null
    try {
      setIsLoading(provider)
      await signIn.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/",
      })
    } catch (err) {
      setIsLoading(null)
      const unknownError = "申し訳ありませんが、何か問題が発生しました。再度お試しください。"
      if(isClerkAPIResponseError(err)){
          toast({ description: unknownError });
      }
    }
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-1 sm:gap-4">
      {oauthProviders.map((provider) => {
        const Icon = Icons[provider.icon]

        return (
          <Button
            aria-label={`Sign in with ${provider.name}`}
            key={provider.strategy}
            variant="outline"
            className="w-full bg-background sm:w-auto"
            onClick={() => void oauthSignIn(provider.strategy)}
            disabled={isLoading !== null}
          >
            {isLoading === provider.strategy ? (
              <Icons.spinner
                className="mr-2 h-4 w-4 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Icon className="mr-2 h-4 w-4" aria-hidden="true" />
            )}
            {provider.name}
          </Button>
        )
      })}
    </div>
  )
}