import { z } from 'zod'

export default z.object({
    name: z.string().default('Untitled'),
    duration: z.number().default(30),
    orderValue: z.number().default(0.1),
    parentID: z.string().default(''),
    startTime: z.string().default(''),
    startDateISO: z.string().default(''),
    iconURL: z.string().default(''),
    timeZone: z.string().default(Intl.DateTimeFormat().resolvedOptions().timeZone),
    notify: z.string().default(''),
    notes: z.string().default(''),
    templateID: z.string().default(''),
    isDone: z.boolean().default(false),
    imageDownloadURL: z.string().default(''),
    imageFullPath: z.string().default(''),
    tags: z.string().default(''),
    isArchived: z.boolean().default(false),
    persistsOnList: z.boolean().default(true),
    listID: z.string().default(''),
    childrenLayout: z.string().default('normal'), // 'normal' or 'timeline'
    treeISOs: z.array(z.string()).optional() // must be computed & maintained
});