'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/useToast"
import { updateProfile, getProfile } from "@/actions/profile"
import { Profile } from "@/types"

export default function EditProfilePage() {
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    async function loadProfile() {
      const result = await getProfile()
      if (result.error) {
        // Only redirect to login if it's an authentication error
        if (result.error === 'Not authenticated') {
          toast({
            variant: "destructive",
            title: "Error",
            description: "You must be logged in to edit your profile",
          })
          router.push('/login')
        } else {
          // For other errors (like profile not found), show info message
          // The form will work because updateProfile can create the profile
          toast({
            variant: "default",
            title: "Create Your Profile",
            description: "Please fill in your profile information below.",
          })
          // Set profile to null - form will use empty defaults via optional chaining
          setProfile(null)
        }
      } else if (result.data) {
        setProfile(result.data)
      }
      setFetchLoading(false)
    }
    loadProfile()
  }, [toast, router])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(event.currentTarget)
      const result = await updateProfile(formData)

      if (result?.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        })
      } else if (result?.success) {
        toast({
          title: "Success",
          description: "Profile updated successfully!",
        })
        router.push('/profile')
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

  if (fetchLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="h-12 bg-muted animate-pulse rounded" />
        <Card>
          <CardHeader>
            <div className="h-6 bg-muted animate-pulse rounded w-1/3" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-10 bg-muted animate-pulse rounded" />
            <div className="h-10 bg-muted animate-pulse rounded" />
            <div className="h-24 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Allow form to render even if profile is null (for new profiles)

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Edit Profile</h1>
        <p className="text-muted-foreground mt-2">
          Update your personal information and interests
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              This information will be visible to other users
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                name="username"
                defaultValue={profile?.username || ''}
                placeholder="johndoe"
                required
                minLength={3}
                maxLength={20}
                pattern="[a-zA-Z0-9_]+"
                title="Username can only contain letters, numbers, and underscores"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                3-20 characters, letters, numbers, and underscores only
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                defaultValue={profile?.full_name || ''}
                placeholder="John Doe"
                minLength={2}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                name="bio"
                defaultValue={profile?.bio || ''}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
                placeholder="Tell others about yourself..."
                maxLength={500}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Maximum 500 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                defaultValue={profile?.location || ''}
                placeholder="e.g. Cape Town, South Africa"
                maxLength={100}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interests">Interests</Label>
              <Input
                id="interests"
                name="interests"
                defaultValue={profile?.interests?.join(', ') || ''}
                placeholder="e.g. hiking, photography, technology"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated, maximum 10 interests. These help us match you with like-minded people.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
            <Link href="/profile">
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

