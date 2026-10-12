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

const pagination = {
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
};

export const resourceListQuerySchema = z
.object({
    ...pagination,
    search: z.string().trim().min(1).max(100).optional(),
    min_capacity: z.coerce.number().int().min(1).optional(),
    sort: z.enum(['id', 'name', 'capacity', 'created_at']).default('id'),
    order: z.enum(['asc', 'desc']).default('asc'),
})
.strict();

export const bookingListQuerySchema = z
.object({
    ...pagination,
    resource_id: z.coerce.number().int().positive().optional(),
    user_id: z.number().int().positive().optional(),
    status: z.enum(['CONFIRMED', 'CANCELLED']).optional(),
    from: isoDateTime.optional(),
    to: isoDateTime.optional(),
    sort: z.enum(['id', 'start_time', 'end_time', 'created_at']).default('start_time'),
    order: z.enum(['asc', 'desc']).default('asc'),
})
.strict()
.refine((q) => !q.from || !q.to || new Date(q.to) > new Date(q.from),{
    message: 'to must be after from',
    path: ['to'],
});

export type ResourceListQuery = z.infer<typeof resourceListQuerySchema>;
export type BookingListQuery = z.infer<typeof bookingListQuerySchema>;