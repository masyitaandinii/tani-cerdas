import 'next-auth';
import { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
    interface Session {
        user: {
            id?: string;
            role?: 'superadmin' | 'admin' | 'user';
            assignedDusun?: number;
        } & DefaultSession['user'];
    }
    
    interface User extends DefaultUser {
        role?: 'superadmin' | 'admin' | 'user';
        assignedDusun?: number;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        role?: 'superadmin' | 'admin' | 'user';
        assignedDusun?: number;
    }
}
