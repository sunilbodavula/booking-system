import { afterEach, describe, expect, it, jest } from '@jest/globals';
import bcrypt from 'bcryptjs';
import * as userRepo from '../../repository/user.repository';
import { login } from '../auth.service';
import { HttpError } from '../../utils/HttpError';


jest.mock('../../repository/user.repository');
jest.mock('../../repository/refreshToken.repository');


const mockedUserRepo = userRepo as jest.Mocked<typeof userRepo>;


describe('auth.service login', () => {
    afterEach(async () => jest.clearAllMocks());

    it('returns the same error for an unknown email and a wrong password', async () => {
        mockedUserRepo.findUserByEmail.mockResolvedValue(null);
        const unknownEmailError = await login({ email: 'nobody@test.com', password: 'whatever123'
        }).catch((e) => e);
        const hash = await bcrypt.hash('correct-password', 4);
        mockedUserRepo.findUserByEmail.mockResolvedValue({
            id: 1, name: 'A', email: 'a@test.com', password: hash, role: 'USER', created_at: new Date(),
        });
        const wrongPasswordError = await login({ email: 'a@test.com', password: 'wrong-password'
        }).catch((e) => e);

        expect(unknownEmailError).toBeInstanceOf(HttpError);
        expect(wrongPasswordError).toBeInstanceOf(HttpError);
        expect(unknownEmailError.message).toBe(wrongPasswordError.message);
        expect(unknownEmailError.statusCode).toBe(401);
    });
});
