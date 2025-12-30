import { z } from 'zod'

export const createGroupSchema = z.object({
  name: z.string().min(3, 'Group name must be at least 3 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000).optional(),
  location: z.string().max(200).optional(),
  category: z.string().min(1, 'Please select a category'),
  privacy: z.enum(['public', 'private', 'invite_only']).default('public'),
})

export const updateGroupSchema = createGroupSchema.partial()

export type CreateGroupInput = z.infer<typeof createGroupSchema>
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>

