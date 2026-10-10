import {Router} from 'express';
import * as controller from '../controller/booking.controller';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get("/", asyncHandler(controller.getAllBookings));
router.get('/:id', asyncHandler(controller.getBookingById));
router.post('/', asyncHandler(controller.createBooking));
router.patch('/:id/cancel', asyncHandler(controller.cancelBooking));

export default router;