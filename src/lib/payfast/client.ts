import crypto from 'crypto'
import { PayFastPayment } from './types'

export function generatePayFastSignature(data: PayFastPayment): string {
  const passphrase = process.env.PAYFAST_PASSPHRASE!
  
  // Create parameter string
  const pfOutput = Object.keys(data)
    .filter(key => data[key as keyof PayFastPayment] !== undefined)
    .sort()
    .map(key => `${key}=${encodeURIComponent(data[key as keyof PayFastPayment] as string)}`)
    .join('&')
  
  const signatureString = passphrase ? `${pfOutput}&passphrase=${passphrase}` : pfOutput
  
  return crypto
    .createHash('md5')
    .update(signatureString)
    .digest('hex')
}

export function createPayFastPaymentUrl(data: PayFastPayment): string {
  const signature = generatePayFastSignature(data)
  const payfastUrl = process.env.NEXT_PUBLIC_PAYFAST_URL || 'https://sandbox.payfast.co.za/eng/process'
  
  const params = new URLSearchParams({
    ...data as any,
    signature,
  })
  
  return `${payfastUrl}?${params.toString()}`
}

export function verifyPayFastSignature(data: Record<string, string>, receivedSignature: string): boolean {
  const passphrase = process.env.PAYFAST_PASSPHRASE!
  const { signature, ...dataWithoutSignature } = data
  
  const pfParamString = Object.keys(dataWithoutSignature)
    .sort()
    .map(key => `${key}=${encodeURIComponent(dataWithoutSignature[key])}`)
    .join('&')
  
  const signatureString = passphrase ? `${pfParamString}&passphrase=${passphrase}` : pfParamString
  
  const calculatedSignature = crypto
    .createHash('md5')
    .update(signatureString)
    .digest('hex')
  
  return calculatedSignature === receivedSignature
}

