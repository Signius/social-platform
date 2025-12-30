export interface PayFastPayment {
  merchant_id: string
  merchant_key: string
  return_url: string
  cancel_url: string
  notify_url: string
  amount: string
  item_name: string
  item_description?: string
  email_address: string
  m_payment_id?: string
  subscription_type?: '1' // 1 = subscription
  billing_date?: string
  recurring_amount?: string
  frequency?: '3' | '4' | '5' | '6' // 3=Monthly, 4=Quarterly, 5=Biannually, 6=Annual
  cycles?: string
}

export interface PayFastNotification {
  m_payment_id: string
  pf_payment_id: string
  payment_status: 'COMPLETE' | 'FAILED' | 'PENDING'
  item_name: string
  item_description?: string
  amount_gross: string
  amount_fee: string
  amount_net: string
  custom_str1?: string
  custom_str2?: string
  custom_str3?: string
  custom_str4?: string
  custom_str5?: string
  custom_int1?: string
  custom_int2?: string
  custom_int3?: string
  custom_int4?: string
  custom_int5?: string
  name_first?: string
  name_last?: string
  email_address: string
  merchant_id: string
  token?: string
  billing_date?: string
  signature: string
}

