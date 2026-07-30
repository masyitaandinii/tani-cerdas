import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { User } from '../app/lib/models/User';

dotenv.config({ path: '.env.local' });
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env or .env.local');
}

async function run() {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.error('Cara penggunaan: npx tsx scripts/setup-superadmin.ts <username> <password>');
        console.error('Contoh: npx tsx scripts/setup-superadmin.ts master_admin rahasia123');
        process.exit(1);
    }

    const [username, password] = args;

    try {
        console.log('Menghubungkan ke database...');
        await mongoose.connect(MONGODB_URI!);

        console.log(`Membuat Super Admin dengan username: ${username}...`);
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Jika username sudah ada, update password-nya. Jika belum, buat baru.
        const existingUser = await User.findOne({ username });
        
        if (existingUser) {
            existingUser.password = hashedPassword;
            existingUser.role = 'superadmin';
            await existingUser.save();
            console.log('Berhasil: Super Admin sudah ada, password berhasil diperbarui!');
        } else {
            await User.create({
                username,
                password: hashedPassword,
                name: 'Super Admin',
                role: 'superadmin'
            });
            console.log('Berhasil: Akun Super Admin baru telah dibuat!');
        }

        process.exit(0);
    } catch (error) {
        console.error('Terjadi kesalahan:', error);
        process.exit(1);
    }
}

run();
