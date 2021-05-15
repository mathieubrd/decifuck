import DeciplusClient from './services/deciplus'
import Course from './models/course'
import { getWantedSlots } from './services/wantedSlots'
import { getCredentials } from './services/credentials'
import Credentials from './models/credentials'
import nextMonday from 'date-fns/nextMonday'
import endOfWeek from 'date-fns/endOfWeek'
import { findCourses } from './helpers'

export const handler = async (): Promise<void> => {
    const credentials = await getCredentials()

    credentials.forEach(async ({email, password}: Credentials) => {
        const client = new DeciplusClient(email, password)
        await client.auth()

        const wantedSlots = await getWantedSlots(email)

        if (wantedSlots.length) {
            const fromDate= nextMonday(new Date())
            const toDate = endOfWeek(fromDate)

            const courses = await client.getCourses(fromDate, toDate)
            const wantedSlotsToBook = findCourses(courses, wantedSlots)
            
            await Promise.all(wantedSlotsToBook.map((course: Course): Promise<Course> => {
                return client.bookCourse(course)
            }))   
        }
    })
}