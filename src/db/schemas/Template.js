import { z } from 'zod';

export default z.object({
    name: z.string(),
    orderValue: z.number().default(0),
    lastGeneratedTask: z.string().default(''),
    crontab: z.string().default(''),
    iconURL: z.string().default(''),
    tags: z.string().default(''),
    timeZone: z.string(),
    notes: z.string().default(''),
    notify: z.string().default(''),
    duration: z.number().default(0),
    startTime: z.string().default(''),
    isStarred: z.boolean().default(false),
});

