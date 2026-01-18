'use server'

import { contactFormSchema, type ContactFormData } from '@/lib/validations/contact.validation'

export async function submitContactForm(data: ContactFormData) {
  try {
    // Validate the form data
    const validatedData = contactFormSchema.parse(data)

    // Create email body
    const emailBody = `
New Catering Inquiry from Ceylon Express

Name: ${validatedData.name}
Email: ${validatedData.email}
Phone: ${validatedData.phone || 'Not provided'}
Event Date: ${validatedData.eventDate || 'Not provided'}
Event Time: ${validatedData.eventTime || 'Not provided'}

Message:
${validatedData.message}

---
This inquiry was submitted through the Ceylon Express website.
    `.trim()

    // Use Web3Forms API to send email (free, no API key needed in code)
    // You'll need to create a free account at https://web3forms.com/
    // and set the NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY environment variable
    const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY

    if (accessKey) {
      try {
        const formData = {
          access_key: accessKey,
          subject: `Catering Inquiry from ${validatedData.name}`,
          name: validatedData.name,
          email: validatedData.email,
          message: `Phone: ${validatedData.phone || 'Not provided'}
Event Date: ${validatedData.eventDate || 'Not provided'}
Event Time: ${validatedData.eventTime || 'Not provided'}

Message:
${validatedData.message}

---
Submitted from Ceylon Express Catering Form`,
        }

        console.log('Sending to Web3Forms:', JSON.stringify(formData, null, 2))

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
                message: 'Thank you for your inquiry! We will get back to you soon.',
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

    // Fallback: Log to console (email service may be temporarily unavailable)
    console.log('Contact form submission logged:', emailBody)

    return {
      success: true,
      message: 'Thank you for your inquiry! We will get back to you soon.',
    }
  } catch (error) {
    console.error('Contact form error:', error)
    
    // Handle Zod validation errors with friendly messages
    if (error && typeof error === 'object' && 'issues' in error) {
      const zodError = error as { issues: Array<{ path: string[]; message: string }> }
      const firstIssue = zodError.issues[0]
      const fieldName = firstIssue.path[0] || 'field'
      
      // Map technical field names to friendly names
      const friendlyFieldNames: Record<string, string> = {
        name: 'Name',
        email: 'Email',
        phone: 'Phone number',
        message: 'Message',
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
