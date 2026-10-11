import { z } from 'zod';

const isoDateTime = z
.string()
.refine((value) => !isNaN(Date.parse(value)), "must be a valid ISO date-time, e.g. 2026-10-20T10:00:00");


export const resourceSchema = z
.object({
    name: z.string().trim().min(1, "Name is required").max(255, "Name must be at most 255 characters"),
    description: z.string().max(5000, "Description must be at most 5000 characters").optional().nullable(),
    capacity: z.number().int("Capacity must be a whole number").min(1, "Capacity must be atleast 1").optional(),
})
.strict();

export const createBookingSchema = z
.object({
    user_id: z.number().int().positive(),
    resource_id: z.number().int().positive(),
    start_time: isoDateTime,
    end_time: isoDateTime,
})
.strict()
.refine((data) => new Date(data.end_time) > new Date(data.start_time), {
    message: "End time must be after start time",
    path: ["end_time"],
})

export type ResourceInput = z.infer<typeof resourceSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;