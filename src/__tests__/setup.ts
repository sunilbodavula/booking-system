import { execSync } from 'child_process';
import './env';

export default async function globalSetup(): Promise<void> {
    execSync('npm run db:migrate', { env: { ...process.env }, stdio: 'inherit' });
}
