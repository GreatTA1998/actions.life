import { z } from 'zod';

export default z.object({
    FCMTokens: z.array(z.string()).default([]),
    email: z.string().default(''),
    isSubscriber: z.boolean().default(false),
    phoneNumber: z.string().optional(),
    maxOrderValue: z.number().default(0),
    uid: z.string(),
});