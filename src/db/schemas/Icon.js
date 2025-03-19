import { z } from 'zod'

export default z.object({
    url: z.string(),
    name: z.string(),
    isShareable: z.boolean(),
    createdBy: z.string(),
    tags: z.string().default(''),
})