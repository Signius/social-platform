import { z } from 'zod'

const eventSchemaBase = z.object({
  title: z.string().min(3, 'Event title must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000).optional(),
  location: z.string().min(1, 'Location is required').max(300),
  startTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid start time',
  }),
  endTime: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: 'Invalid end time',
  }),
  capacity: z.number().int().positive().optional(),
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
})

export const createEventSchema = eventSchemaBase.refine(
  (data) => {
    if (data.endTime) {
      return new Date(data.startTime) < new Date(data.endTime)
    }
    return true
  },
  {
    message: 'End time must be after start time',
    path: ['endTime'],
  }
)

export const updateEventSchema = eventSchemaBase.partial()

export const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(1000),
  parentId: z.string().uuid().optional(),
})

export type CreateEventInput = z.infer<typeof createEventSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>
export type CommentInput = z.infer<typeof commentSchema>

