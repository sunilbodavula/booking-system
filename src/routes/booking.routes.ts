import {Router} from 'express';
import * as controller from '../controller/booking.controller';
import { asyncHandler } from '../utils/asyncHandler';
import { validate, validateQuery } from '../middleware/validate';
import { createBookingSchema, bookingListQuerySchema } from '../validation/schema';
import { bookingWriteLimiter } from '../middleware/rateLimit';

const router = Router();

router.get("/", bookingWriteLimiter, validateQuery(bookingListQuerySchema), asyncHandler(controller.getAllBookings));
router.get('/:id', asyncHandler(controller.getBookingById));
router.post('/', validate(createBookingSchema), asyncHandler(controller.createBooking));
router.patch('/:id/cancel', asyncHandler(controller.cancelBooking));

export default router;