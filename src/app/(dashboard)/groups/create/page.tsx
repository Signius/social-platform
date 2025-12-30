'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/useToast"
import { createGroup } from "@/actions/groups"
import { GROUP_CATEGORIES } from "@/lib/utils/constants"

export default function CreateGroupPage() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(event.currentTarget)
      const result = await createGroup(formData)

      if (result?.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        })
      } else if (result?.data) {
        toast({
          title: "Success",
          description: "Group created successfully!",
        })
        router.push(`/groups/${result.data.slug}`)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Create a Group</h1>
        <p className="text-muted-foreground mt-2">
          Start a community around your interests
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Group Details</CardTitle>
            <CardDescription>
              Tell us about your group and what makes it special
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Group Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g. Weekend Hikers"
                required
                minLength={3}
                maxLength={100}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Choose a clear, descriptive name (3-100 characters)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                name="category"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
                disabled={loading}
              >
                <option value="">Select a category</option>
                {GROUP_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[120px]"
                placeholder="What's your group about? What activities do you plan?"
                minLength={10}
                maxLength={1000}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Optional, but helps people find your group (10-1000 characters)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                placeholder="e.g. Cape Town, South Africa"
                maxLength={200}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Optional - helps connect you with nearby members
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="privacy">Privacy Setting *</Label>
              <select
                id="privacy"
                name="privacy"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
                disabled={loading}
                defaultValue="public"
              >
                <option value="public">Public - Anyone can find and join</option>
                <option value="private">Private - Users can request to join</option>
                <option value="invite_only">Invite Only - Only invited users can join</option>
              </select>
            </div>
          </CardContent>
          <CardFooter className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Group"}
            </Button>
            <Link href="/groups">
              <Button type="button" variant="outline" disabled={loading}>
                Cancel
              </Button>
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

