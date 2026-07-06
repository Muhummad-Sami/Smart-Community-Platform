import { Response } from 'express'

export const successResponse = (
  res: Response,
  data: any,
  message: string = 'Success',
  statusCode: number = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  })
}

export const errorResponse = (
  res: Response,
  message: string = 'Error occurred',
  statusCode: number = 400,
  errors?: any
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  })
}

export const createdResponse = (
  res: Response,
  data: any,
  message: string = 'Resource created successfully'
) => {
  return successResponse(res, data, message, 201)
}

export const noContentResponse = (res: Response) => {
  return res.status(204).send()
}
