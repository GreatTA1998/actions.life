import { DateTime } from 'luxon'
import OpenAI from 'openai'
import { systemPrompt } from './systemPrompt'

const client = new OpenAI({
  apiKey: import.meta.env.VITE_PUBLIC_BROWSER_NAME,
  dangerouslyAllowBrowser: true,
})

async function chat(tasks, chat) {
  const messages = [
    {
      role: "system",
      content: `Today is ${DateTime.now().toISODate()}. ${systemPrompt}: ${tasks}`,
    },
    ...chat,
  ]
  const response = await client.chat.completions
    .create({ model: "gpt-4o-2024-08-06", messages: messages })
    .catch((err) => {
      console.error("error in GPT.chat: ", err)
    })
  return response.choices[0].message
}

export default { chat } 