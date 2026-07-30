import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { User } from '../app/lib/models/User';
import { TengkulakRecord } from '../app/lib/models/TengkulakRecord';

// Load env vars
dotenv.config({ path: '.env.local' });
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

async function seed() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(MONGODB_URI!);
        console.log('Connected.');

        console.log('Clearing existing data...');
        await User.deleteMany({});
        await TengkulakRecord.deleteMany({});

        console.log('Hashing passwords...');
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash('123', saltRounds);

        console.log('Creating users...');
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const superadmin = await User.create({
            username: 'superadmin',
            name: 'Super Admin',
            role: 'superadmin',
            password: hashedPassword
        });

        const admin1 = await User.create({
            username: 'admin1',
            name: 'Admin Dusun 1',
            role: 'admin',
            password: hashedPassword,
            assignedDusun: 1
        });
        
        const admin2 = await User.create({
            username: 'admin2',
            name: 'Admin Dusun 2',
            role: 'admin',
            password: hashedPassword,
            assignedDusun: 2
        });

        const admin3 = await User.create({
            username: 'admin3',
            name: 'Admin Dusun 3',
            role: 'admin',
            password: hashedPassword,
            assignedDusun: 3
        });

        const admin4 = await User.create({
            username: 'admin4',
            name: 'Admin Dusun 4',
            role: 'admin',
            password: hashedPassword,
            assignedDusun: 4
        });

        console.log('Creating sample records...');
        const dummyRecords = [];
        const kuartals = ['Q1', 'Q2', 'Q3', 'Q4'];
        const dusuns = [1, 2, 3, 4] as const;
        const admins = { 
            1: admin1._id, 
            2: admin2._id, 
            3: admin3._id, 
            4: admin4._id 
        };
        const baseHargaBeras = 14000;
        const baseHargaGabah = 7000;
        
        const names = ["Budi", "Ani", "Joko", "Siti", "Wati", "Agus", "Supri", "Tono", "Yanto", "Rina", "Dewi", "Eko", "Bambang", "Suharto", "Kartini"];
        const currentYear = new Date().getFullYear();

        for (const dusun of dusuns) {
            for (const kuartal of kuartals) {
                // 5 to 10 records
                const count = Math.floor(Math.random() * 6) + 5; 
                for (let i = 0; i < count; i++) {
                    const randomName = names[Math.floor(Math.random() * names.length)];
                    
                    // Harga Beras 13k - 16k
                    const hargaBeras = baseHargaBeras + Math.floor(Math.random() * 2000) - 500;
                    // Harga Gabah 6.5k - 8k
                    const hargaGabah = baseHargaGabah + Math.floor(Math.random() * 1000) - 250;
                    
                    // Total panen 500 to 4500 kg
                    const totalPanen = Math.floor(Math.random() * 4000) + 500;
                    
                    // Distribute timestamp inside the year based on Kuartal
                    let month = 0;
                    if (kuartal === 'Q1') month = Math.floor(Math.random() * 3);
                    if (kuartal === 'Q2') month = Math.floor(Math.random() * 3) + 3;
                    if (kuartal === 'Q3') month = Math.floor(Math.random() * 3) + 6;
                    if (kuartal === 'Q4') month = Math.floor(Math.random() * 3) + 9;
                    
                    const date = new Date(currentYear, month, Math.floor(Math.random() * 28) + 1);

                    dummyRecords.push({
                        nama: `Tengkulak ${randomName}`,
                        dusun: dusun,
                        hargaBeras: hargaBeras,
                        hargaGabah: hargaGabah,
                        kuartal: kuartal,
                        totalPanen: totalPanen,
                        authorId: admins[dusun],
                        timestamp: date
                    });
                }
            }
        }

        await TengkulakRecord.insertMany(dummyRecords);
        console.log(`Inserted ${dummyRecords.length} dummy records!`);

        console.log('Seed completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
}

seed();
