
import { Prisma } from '@prisma/client';

console.log("Checking Prisma Client Model Definitions...");
const dmmf = Prisma.dmmf;
const userModel = dmmf.datamodel.models.find(m => m.name === 'User');

if (userModel) {
    const fields = userModel.fields.map(f => f.name);
    console.log("User Model Fields:", fields);

    if (fields.includes('verificationCode')) {
        console.log("✅ verificationCode EXISTS in Prisma Client.");
    } else {
        console.log("❌ verificationCode MISSING in Prisma Client.");
    }
} else {
    console.log("❌ User model not found.");
}
