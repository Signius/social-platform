import { z } from 'zod'

export const profileSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
  bio: z.string().max(500, 'Bio must be at most 500 characters').optional(),
  location: z.string().max(100, 'Location must be at most 100 characters').optional(),
  interests: z.array(z.string()).max(10, 'You can select up to 10 interests').optional(),
})

export type ProfileInput = z.infer<typeof profileSchema>

