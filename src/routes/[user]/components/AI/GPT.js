import { DateTime } from "luxon"
import OpenAI from "openai"
const client = new OpenAI({
  apiKey: import.meta.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
})

async function chat(tasks, chat) {
  const messages = [
    {
      role: "system",
      content: `Today is ${DateTime.now().toISODate()}. This is a JSON of user Tasks and events. analyse the data and share interesting and actionable insights into their lives. ${tasks}`,
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