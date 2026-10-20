export const getErrorMessage = (error: unknown, fallback: string) => {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as {
      response?: { data?: { message?: string; errors?: Array<{ message?: string }> } }
    }).response

    const responseMessage = response?.data?.message
    const nestedMessage = response?.data?.errors?.[0]?.message

    return responseMessage || nestedMessage || fallback
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}
