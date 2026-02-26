"use server"

import { auth } from "@/lib/auth"
import { withDb } from "@/lib/db"
import { revalidatePath } from "next/cache"

async function requireAdmin() {
    const session = await auth()
    const role = session?.user?.role
    if (!session?.user || (role !== "ADMIN" && role !== "SUPER_ADMIN" && role !== "STAFF")) {
        throw new Error("Unauthorized")
    }
    return session
}

export async function importStudentsCSV(csvData: string) {
    await requireAdmin()

    const rows = csvData.split("\n").map(r => r.trim()).filter(r => r.length > 0)
    if (rows.length < 2) return { success: false, error: "Empty or invalid CSV file" }

    const firstRow = rows[0]
    if (!firstRow) return { success: false, error: "Empty CSV file" }

    const headers = firstRow.split(",").map(h => h.trim().toLowerCase())

    // Check required headers
    const requiredHeaders = ["studentid", "firstname", "lastname", "email", "program", "yearofstudy"]
    const hasAllHeaders = requiredHeaders.every(h => headers.includes(h))
    if (!hasAllHeaders) return { success: false, error: "Missing required headers. Required: StudentID, FirstName, LastName, Email, Program, YearOfStudy" }

    let imported = 0
    let failed = 0
    const errors: string[] = []

    const institutionId = "INST-001"
    const departmentId = "DEPT-CS"

    await withDb(async (db) => {
        for (let i = 1; i < rows.length; i++) {
            const rowStr = rows[i]
            if (!rowStr) continue
            const cols = rowStr.split(",").map(c => c.trim())
            if (cols.length !== headers.length) continue

            const rowData: Record<string, string> = {}
            headers.forEach((h, index) => {
                const colVal = cols[index]
                if (h && colVal !== undefined) {
                    rowData[h] = colVal
                }
            })

            try {
                const yearOfStudy = parseInt(rowData["yearofstudy"] || "1") || 1
                await db.query(`
                    INSERT INTO students (student_id, first_name, last_name, email, program, year_of_study, institution_id, department_id)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                `, [rowData["studentid"], rowData["firstname"], rowData["lastname"], rowData["email"], rowData["program"], yearOfStudy, institutionId, departmentId])
                imported++
            } catch (err: unknown) {
                failed++
                errors.push(`Row ${i + 1} (${rowData["studentid"] || "unknown"}): ${(err as Error).message}`)
            }
        }
    })

    revalidatePath("/dashboard/students")
    return { success: true, data: { imported, failed, errors } }
}
