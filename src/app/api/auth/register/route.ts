import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import Shop from '@/models/Shop';
import Account from '@/models/Account';
import Subscription from '@/models/Subscription';
import TempUser from '@/models/TempUser';
import PublicUser from '@/models/PublicUser';
import generateToken from '@/lib/generateToken';
import { ADMIN_EMAILS } from '@/config/adminEmails';

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();
        const { name, email, shopName, businessType, plan } = await req.json();

        if (!name || !email || !shopName || !businessType) {
            return NextResponse.json(
                { message: 'Please provide all required fields' },
                { status: 400 }
            );
        }

        // 1. Verify TempUser exists and has completed previous steps
        const tempUser = await TempUser.findOne({ email }).select('+password');
        if (!tempUser || tempUser.step !== 'password_set') {
            return NextResponse.json(
                { message: 'Invalid registration session. Please verify your email first.' },
                { status: 400 }
            );
        }

        const userExistsInAuthorized = await User.findOne({ email });
        const userExistsInPublic = await PublicUser.findOne({ email });

        if (userExistsInAuthorized || userExistsInPublic) {
            return NextResponse.json(
                { message: 'User already exists' },
                { status: 400 }
            );
        }

        // 2. Decide where to store the user
        const isAuthorized = ADMIN_EMAILS.includes(email.toLowerCase());
        const userRole = isAuthorized ? 'admin' : 'user';

        let user;
        let dashboardAccess = false;

        if (isAuthorized) {
            // Authorized users (Admins) go to User collection
            user = await User.create({
                name,
                email,
                password: tempUser.password,
                role: userRole,
                dashboardAccess: true
            });
            dashboardAccess = true;
        } else {
            // General users go to PublicUser collection
            user = await PublicUser.create({
                name,
                email,
                password: tempUser.password,
                role: userRole
            });
            dashboardAccess = false;
        }

        if (user) {
            // 3. Create Shop for the user (only if they are going to have a shop, 
            // but for now let's keep it consistent with your previous logic if you want them to have a 'potential' shop)
            const shop = await Shop.create({
                name: shopName,
                businessType,
                owner: user._id,
                plan: plan || 'free',
                subscriptionStatus: 'trial'
            });

            // 4. Link Shop (Only for Authorized Users who have a shop field)
            if (isAuthorized) {
                user.shop = shop._id;
                await user.save();
            }

            // 5. Create Subscription record
            const trialDays = 14;
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + trialDays);

            await Subscription.create({
                shop: shop._id,
                plan: plan || 'free',
                status: 'trialing',
                endDate
            });

            // 6. Bootstrap Default Accounts
            const bootstrapAccounts = [
                { name: 'Cash', type: 'Asset', shop: shop._id },
                { name: 'Sales', type: 'Revenue', shop: shop._id },
                { name: 'Debtors', type: 'Asset', shop: shop._id }
            ];
            await Account.insertMany(bootstrapAccounts);

            // 7. Cleanup TempUser
            await TempUser.deleteOne({ _id: tempUser._id });

            const response = NextResponse.json(
                {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    shopId: shop._id,
                    role: userRole,
                    dashboardAccess,
                    token: generateToken(user._id, user.email, userRole),
                },
                { status: 201 }
            );

            // Set a secure cookie for the Proxy (Middleware) to read
            response.cookies.set('dashboardAccess', dashboardAccess.toString(), {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60, // 7 days
                path: '/',
            });

            return response;
        } else {
            return NextResponse.json(
                { message: 'Invalid user data' },
                { status: 400 }
            );
        }
    } catch (error: any) {
        console.error('Register error:', error);
        return NextResponse.json(
            { message: error?.message || 'Server Error' },
            { status: 500 }
        );
    }
}
