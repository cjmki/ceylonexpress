'use server'

import { careersFormSchema, type CareersFormData } from '@/lib/validations/careers.validation'

export async function submitCareersForm(data: CareersFormData) {
  try {
    // Validate the form data
    const validatedData = careersFormSchema.parse(data)

    // Use Web3Forms API to send email
    const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY

    if (accessKey) {
      try {
        const formData = {
          access_key: accessKey,
          subject: `Job Application: ${validatedData.jobTitle} - ${validatedData.name}`,
          name: validatedData.name,
          email: validatedData.email,
          message: `JOB APPLICATION

Position: ${validatedData.jobTitle}

Applicant Details:
Name: ${validatedData.name}
Email: ${validatedData.email}
Phone: ${validatedData.phone}
${validatedData.socialMedia ? `Social Media: ${validatedData.socialMedia}` : ''}

About Them:
${validatedData.message}

---
Submitted from Ceylon Express Careers Page`,
        }

        console.log('Sending careers application to Web3Forms:', JSON.stringify(formData, null, 2))

        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(formData),
        })

        console.log('Web3Forms response status:', response.status)
        const responseText = await response.text()
        console.log('Web3Forms response:', responseText)

        if (response.ok) {
          try {
            const result = JSON.parse(responseText)
            console.log('Web3Forms result:', result)
            
            if (result.success) {
              return {
                success: true,
                message: 'Thank you for your application! We will review it and get back to you soon.',
              }
            } else {
              console.error('Web3Forms error:', result.message || 'Unknown error')
            }
          } catch (parseError) {
            console.error('Failed to parse Web3Forms response:', parseError)
          }
        } else {
          console.error('Web3Forms HTTP error:', response.status, responseText)
        }
      } catch (fetchError) {
        console.error('Network error contacting Web3Forms:', fetchError)
      }
    }

    // Fallback: Log to console
    console.log('Careers application logged for:', validatedData.jobTitle, validatedData.name)

    return {
      success: true,
      message: 'Thank you for your application! We will review it and get back to you soon.',
    }
  } catch (error) {
    console.error('Careers form error:', error)
    
    // Handle Zod validation errors with friendly messages
    if (error && typeof error === 'object' && 'issues' in error) {
      const zodError = error as { issues: Array<{ path: string[]; message: string }> }
      const firstIssue = zodError.issues[0]
      const fieldName = firstIssue.path[0] || 'field'
      
      const friendlyFieldNames: Record<string, string> = {
        name: 'Name',
        email: 'Email',
        phone: 'Phone number',
        jobTitle: 'Position',
        message: 'About you',
      }
      
      return {
        success: false,
        message: `${friendlyFieldNames[fieldName] || fieldName}: ${firstIssue.message}`,
      }
    }
    
    if (error instanceof Error) {
      return {
        success: false,
        message: 'Please check your information and try again',
      }
    }
    
    return {
      success: false,
      message: 'An error occurred. Please try again or contact us directly at cvljayawardana@gmail.com',
    }
  }
}
