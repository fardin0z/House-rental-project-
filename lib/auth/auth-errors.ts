export function mapAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes("email not confirmed") ||
    lower.includes("email not verified") ||
    lower.includes("confirm your email")
  ) {
    return "ইমেইল যাচাই করা হয়নি। আপনার ইমেইলে পাঠানো লিংকে ক্লিক করে যাচাই সম্পন্ন করুন।";
  }
  if (
    lower.includes("phone not confirmed") ||
    lower.includes("phone_not_confirmed")
  ) {
    return "মোবাইল নম্বর যাচাই করা হয়নি। SMS-এ পাঠানো OTP দিয়ে যাচাই করুন।";
  }
  if (
    lower.includes("token has expired") ||
    lower.includes("otp_expired") ||
    lower.includes("invalid otp") ||
    lower.includes("token is invalid") ||
    lower.includes("otp has expired")
  ) {
    return "কোডটি ভুল বা মেয়াদ শেষ। নতুন কোড নিন।";
  }
  if (lower.includes("invalid login") || lower.includes("invalid credentials")) {
    return "ভুল তথ্য। মোবাইল/ইমেইল বা পাসওয়ার্ড মিলছে না।";
  }
  if (lower.includes("already registered") || lower.includes("already exists")) {
    return "এই অ্যাকাউন্ট আগে থেকেই আছে। লগইন করুন।";
  }
  if (
    lower.includes("sms_send_rate_limit") ||
    lower.includes("over_sms_send_rate_limit") ||
    lower.includes("sms rate limit")
  ) {
    return "কিছুক্ষণ আগেই কোড পাঠানো হয়েছে। ১ মিনিট পর আবার চেষ্টা করুন।";
  }
  if (
    lower.includes("rate limit") ||
    lower.includes("too many requests") ||
    lower.includes("over_email_send_rate_limit") ||
    lower.includes("email rate limit") ||
    lower.includes("for security purposes")
  ) {
    return "অনেক বেশি অনুরোধ। কিছুক্ষণ পর আবার চেষ্টা করুন।";
  }
  if (
    lower.includes("already confirmed") ||
    lower.includes("already been registered") ||
    lower.includes("user_already_confirmed")
  ) {
    return "এই অ্যাকাউন্ট ইতিমধ্যে যাচাই করা হয়েছে। লগইন করুন।";
  }
  if (lower.includes("user not found")) {
    return "এই তথ্যে কোনো অ্যাকাউন্ট নেই। প্রথমে অ্যাকাউন্ট তৈরি করুন।";
  }
  if (lower.includes("smtp") || lower.includes("email service")) {
    return "মেইল পরিষেবায় সমস্যা। কিছুক্ষণ পর আবার চেষ্টা করুন।";
  }
  if (
    lower.includes("error sending sms") ||
    lower.includes("sms hook") ||
    lower.includes("hook")
  ) {
    return "SMS পাঠাতে সমস্যা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।";
  }
  if (
    lower.includes("phone signups are disabled") ||
    lower.includes("phone_provider_disabled") ||
    lower.includes("signup is disabled")
  ) {
    return "মোবাইল সাইনআপ এই মুহূর্তে বন্ধ আছে। ইমেইল দিয়ে চেষ্টা করুন অথবা একটু পরে আবার চেষ্টা করুন।";
  }
  if (lower.includes("weak") || lower.includes("password")) {
    return "পাসওয়ার্ড দুর্বল। আরও শক্তিশালী পাসওয়ার্ড দিন।";
  }
  return "সমস্যা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।";
}
