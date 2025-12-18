import { getFirestoreCollection, updateFirestoreDoc } from '$lib/db/helpers.js'
import { DateTime } from 'luxon'

export async function rerunHabits () {
  const templates = await getFirestoreCollection('/users/yGVJSutBrnS1156uopQQOBuwpMl2/templates')
  let count = 0
  for (const template of templates) {
    if (!['Drink water', 'Meditate', 'Turn off heater', 'Soundcore A9'].includes(template.name)) {
      if (template.rrStr?.includes('FREQ=WEEKLY'))  {
        console.log('template =', template.name)
        count += 1
        updateFirestoreDoc(`/users/yGVJSutBrnS1156uopQQOBuwpMl2/templates/${template.id}`, {
          prevEndISO: DateTime.now().toFormat('yyyy-MM-dd')
        })
      }
    }
  }
  console.log('count', count)
}