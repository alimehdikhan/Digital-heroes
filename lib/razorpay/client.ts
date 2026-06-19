import Razorpay from 'razorpay'

// Using null check to prevent dev server crash if variables are not set yet
export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
})
