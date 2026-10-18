import { afterEach, describe, expect, it, jest } from '@jest/globals';
import * as bookingRepo from '../../repository/booking.repository';
import * as resourceRepo from '../../repository/resource.repository';
import { cancelBooking, createBooking, getBookingById } from '../booking.service';
import { AuthUser, Booking } from '../../types';
import { HttpError } from '../../utils/HttpError';
import { emitBookingCancelled, emitBookingCreated } from '../../realtime/socket';
import { get } from 'node:http';

jest.mock('../../repository/booking.repository');
jest.mock('../../repository/resource.repository');

const mockedBookingRepo = bookingRepo as jest.Mocked<typeof bookingRepo>;
const mockedResourceRepo = resourceRepo as jest.Mocked<typeof resourceRepo>;

jest.mock('../../realtime/socket', () => ({
    emitBookingCreated: jest.fn(),
    emitBookingCancelled: jest.fn(),
}));

const sampleBooking = (overrides: Partial<Booking> = {}): Booking => ({
    id: 1,
    user_id: 10,
    resource_id: 1,
    start_time: new Date('2027-01-01T10:00:00Z'),
    end_time: new Date('2027-01-01T11:00:00Z'),
    status: 'CONFIRMED',
    created_at: new Date(),
    ...overrides,
});

describe('booking.service', () => {
    afterEach(async () => jest.clearAllMocks());

    describe('getBookingId', () => {
        it('returns the booking for its owner', async () => {
            const booking = sampleBooking({user_id: 10});
            mockedBookingRepo.findBookingById.mockResolvedValue(booking);
            const actor: AuthUser = {id: 10, role: 'USER'};

            await expect(getBookingById(1, actor)).resolves.toEqual(booking);
        });

        it('returns 404 for a booking that belongs to someone else', async () => {
            const booking = sampleBooking({ user_id: 99 });
            mockedBookingRepo.findBookingById.mockResolvedValue(booking);
            const actor: AuthUser = { id: 10, role: 'USER' };

            await expect(getBookingById(1, actor)).rejects.toThrow(HttpError);
         });

        it('lets an admin see any booking', async () => {
            const booking = sampleBooking({ user_id: 99 });
            mockedBookingRepo.findBookingById.mockResolvedValue(booking);
            const admin: AuthUser = { id: 1, role: 'ADMIN' };
            await expect(getBookingById(1, admin)).resolves.toEqual(booking);
        });
    })

    describe('createBooking', () => {
        it('rejects an unknown resource before touching the booking repository', async () => {
            mockedResourceRepo.findResourceById.mockResolvedValue(null);
            await expect(
            createBooking(10, { resource_id: 999, start_time: '2027-01-01T10:00:00Z', end_time: '2027-01-01T11:00:00Z' })
                ).rejects.toThrow(HttpError);
            expect(mockedBookingRepo.createBooking).not.toHaveBeenCalled();
        });
        it('passes the userId from the token, not from the request body', async () => {
            mockedResourceRepo.findResourceById.mockResolvedValue({
            id: 1, name: 'Room A', description: null, capacity: 4, created_at: new Date(),
        });
        const booking = sampleBooking();
        mockedBookingRepo.createBooking.mockResolvedValue(booking);
        await createBooking(10, { resource_id: 1, start_time: '2027-01-01T10:00:00Z', end_time: '2027-01-01T11:00:00Z' });
        expect(mockedBookingRepo.createBooking).toHaveBeenCalledWith(10, expect.objectContaining({
        resource_id: 1 }));
        });
    });

    describe('cancelBooking', () => {
        it('rejects cancelling an already-cancelled booking', async () => {
            const booking = sampleBooking({ user_id: 10, status: 'CANCELLED' });
            mockedBookingRepo.findBookingById.mockResolvedValue(booking);
            const actor: AuthUser = { id: 10, role: 'USER' };
            await expect(cancelBooking(1, actor)).rejects.toThrow(HttpError);
            expect(mockedBookingRepo.cancelBooking).not.toHaveBeenCalled();
        });
    });

})

