import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import connectToDatabase from './db';
import { User } from './models/User';

if (!process.env.NEXTAUTH_SECRET && process.env.NODE_ENV !== 'test') {
    throw new Error('NEXTAUTH_SECRET wajib di-set di environment variable');
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    throw new Error('Username and password are required');
                }

                await connectToDatabase();
                
                const inputUsername = credentials.username.trim();
                const escapedUsername = inputUsername.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

                // 1. Try exact or case-insensitive match by username
                let user = await User.findOne({
                    username: { $regex: new RegExp(`^${escapedUsername}$`, 'i') }
                });

                // 2. If not found, try matching by name
                if (!user) {
                    user = await User.findOne({
                        name: { $regex: new RegExp(`^${escapedUsername}$`, 'i') }
                    });
                }

                // 3. If still not found, check common aliases (e.g. 'superadmin', 'admin1', 'admin 1', 'dusun1', 'dusun 1')
                if (!user) {
                    const lower = inputUsername.toLowerCase().replace(/\s+/g, '');
                    if (lower === 'superadmin') {
                        user = await User.findOne({ role: 'superadmin' });
                    } else {
                        const adminMatch = lower.match(/^(?:admin|dusun)([1-4])$/);
                        if (adminMatch) {
                            const dusunNumber = parseInt(adminMatch[1], 10);
                            user = await User.findOne({ role: 'admin', assignedDusun: dusunNumber });
                        }
                    }
                }
                
                if (!user || !user.password) {
                    throw new Error('Invalid username or password');
                }

                const isValid = await bcrypt.compare(credentials.password, user.password);
                
                if (!isValid) {
                    throw new Error('Invalid username or password');
                }

                return {
                    id: user._id.toString(),
                    name: user.name,
                    role: user.role,
                    assignedDusun: user.assignedDusun
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.assignedDusun = user.assignedDusun;
            }
            return token;
        },
        async session({ session, token }) {
            if (session?.user) {
                session.user.role = token.role;
                session.user.assignedDusun = token.assignedDusun;
            }
            return session;
        }
    },
    session: {
        strategy: 'jwt'
    },
    secret: process.env.NEXTAUTH_SECRET,
};
