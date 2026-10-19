import dotenv from 'dotenv';

// override: true so the test DB wins over anything already loaded from .env
dotenv.config({ path: '.env.test', override: true });

if (!process.env.DB_NAME?.endsWith('_test')) {
    throw new Error(`Refusing to run tests against non-test database "${process.env.DB_NAME}"`);
}
