const ROUTES = {
  // Ingress
  INGRESS: "INGRESS",

  // Authentication
  AUTHENTICATION: "AUTHENTICATION",
  AUTHENTICATION_LANDING: "AUTHENTICATION_LANDING",
  AUTHENTICATION_IDP_SELECTION: "AUTHENTICATION_IPD_SELECTION",
  AUTHENTICATION_IDP_LOGIN: "AUTHENTICATION_IDP_LOGIN",
  AUTHENTICATION_IDP_TEST: "AUTHENTICATION_IDP_TEST",
  AUTHENTICATION_SPID_INFORMATION: "AUTHENTICATION_SPID_INFORMATION",
  AUTHENTICATION_SPID_CIE_INFORMATION: "AUTHENTICATION_SPID_CIE_INFORMATION",
  AUTHENTICATION_CIE: "AUTHENTICATION_CIE",
  MARKDOWN: "MARKDOWN",

  // CIE
  CIE_EXPIRED_SCREEN: "CIE_EXPIRED_SCREEN",
  CIE_PIN_SCREEN: "CIE_PIN_SCREEN",
  CIE_AUTHORIZE_USAGE_SCREEN: "CIE_AUTHORIZE_USAGE_SCREEN",
  CIE_CARD_READER_SCREEN: "CIE_CARD_READER_SCREEN",
  CIE_CONSENT_DATA_USAGE: "CIE_CONSENT_DATA_USAGE",
  CIE_WRONG_PIN_SCREEN: "CIE_WRONG_PIN_SCREEN",
  CIE_PIN_TEMP_LOCKED_SCREEN: "CIE_PIN_TEMP_LOCKED_SCREEN",

  // Onboarding
  ONBOARDING: "ONBOARDING",
  ONBOARDING_TOS: "ONBOARDING_TOS",
  ONBOARDING_SHARE_DATA: "ONBOARDING_SHARE_DATA",
  ONBOARDING_SERVICES_PREFERENCE: "ONBOARDING_SERVICES_PREFERENCE",
  ONBOARDING_SERVICES_PREFERENCE_COMPLETE:
    "ONBOARDING_SERVICES_PREFERENCE_COMPLETE",
  ONBOARDING_PIN: "ONBOARDING_PIN",
  ONBOARDING_FINGERPRINT: "ONBOARDING_FINGERPRINT",
  ONBOARDING_COMPLETED: "ONBOARDING_COMPLETED",

  // Wallet
  WALLET_NAVIGATOR: "WALLET_NAVIGATOR",
  WALLET_HOME: "WALLET_HOME",
  WALLET_TRANSACTION_DETAILS: "WALLET_TRANSACTION_DETAILS",
  WALLET_CREDIT_CARD_DETAIL: "WALLET_CREDIT_CARD_DETAIL",
  WALLET_BANCOMAT_DETAIL: "WALLET_BANCOMAT_DETAIL",
  WALLET_SATISPAY_DETAIL: "WALLET_SATISPAY_DETAIL",
  WALLET_PAYPAL_DETAIL: "WALLET_PAYPAL_DETAIL",
  WALLET_PAYPAL_UPDATE_PAYMENT_PSP: "WALLET_PAYPAL_UPDATE_PAYMENT_PSP",
  WALLET_BPAY_DETAIL: "WALLET_BPAY_DETAIL",
  WALLET_COBADGE_DETAIL: "WALLET_COBADGE_DETAIL",
  WALLET_PRIVATIVE_DETAIL: "WALLET_PRIVATIVE_DETAIL",
  WALLET_ADD_PAYMENT_METHOD: "WALLET_ADD_PAYMENT_METHOD",
  WALLET_ADD_CARD: "WALLET_ADD_CARD",
  WALLET_CONFIRM_CARD_DETAILS: "WALLET_CONFIRM_CARD_DETAILS",
  WALLET_CHECKOUT_3DS_SCREEN: "WALLET_CHECKOUT_3DS_SCREEN",
  ADD_CREDIT_CARD_OUTCOMECODE_MESSAGE: "ADD_CREDIT_CARD_OUTCOMECODE_MESSAGE",

  // Payment
  PAYMENT_SCAN_QR_CODE: "PAYMENT_SCAN_QR_CODE",
  PAYMENT_MANUAL_DATA_INSERTION: "PAYMENT_MANUAL_DATA_INSERTION",
  PAYMENT_TRANSACTION_SUMMARY: "PAYMENT_TRANSACTION_SUMMARY",
  PAYMENT_TRANSACTION_ERROR: "PAYMENT_TRANSACTION_ERROR",
  PAYMENT_PICK_PAYMENT_METHOD: "PAYMENT_PICK_PAYMENT_METHOD",
  PAYMENT_CONFIRM_PAYMENT_METHOD: "PAYMENT_CONFIRM_PAYMENT_METHOD",
  PAYMENT_PICK_PSP: "PAYMENT_PICK_PSP",
  PAYMENTS_HISTORY_SCREEN: "PAYMENTS_HISTORY_SCREEN",
  PAYMENT_HISTORY_DETAIL_INFO: "PAYMENT_HISTORY_DETAIL_INFO",
  CREDIT_CARD_ONBOARDING_ATTEMPTS_SCREEN:
    "CREDIT_CARD_ONBOARDING_ATTEMPTS_SCREEN",
  CREDIT_CARD_ONBOARDING_ATTEMPT_DETAIL:
    "CREDIT_CARD_ONBOARDING_ATTEMPT_DETAIL",
  PAYMENT_OUTCOMECODE_MESSAGE: "PAYMENT_OUTCOMECODE_MESSAGE",

  // Main
  MAIN: "MAIN",

  // Messages
  MESSAGES_NAVIGATOR: "MESSAGES_NAVIGATOR",
  MESSAGES_HOME: "MESSAGES_HOME",
  MESSAGE_ROUTER_PAGINATED: "MESSAGE_ROUTER_PAGINATED",
  MESSAGE_DETAIL_PAGINATED: "MESSAGE_DETAIL_PAGINATED",

  // Services
  SERVICES_NAVIGATOR: "SERVICES_NAVIGATOR",
  SERVICES_HOME: "SERVICES_HOME",
  SERVICE_DETAIL: "SERVICE_DETAIL",
  SERVICE_WEBVIEW: "SERVICE_WEBVIEW",

  // Profile
  PROFILE_NAVIGATOR: "PROFILE_NAVIGATOR",
  PROFILE_MAIN: "PROFILE_MAIN",
  PROFILE_PRIVACY: "PROFILE_PRIVACY",
  PROFILE_PRIVACY_MAIN: "PROFILE_PRIVACY_MAIN",
  PROFILE_PRIVACY_SHARE_DATA: "PROFILE_PRIVACY_SHARE_DATA",
  PROFILE_PREFERENCES_HOME: "PROFILE_PREFERENCES_HOME",
  PROFILE_PREFERENCES_SERVICES: "PROFILE_PREFERENCES_SERVICES",
  PROFILE_DATA: "PROFILE_DATA",
  PROFILE_SECURITY: "PROFILE_SECURITY",
  PROFILE_PREFERENCES_EMAIL_FORWARDING: "PROFILE_PREFERENCES_EMAIL_FORWARDING",
  PROFILE_PREFERENCES_CALENDAR: "PROFILE_PREFERENCES_CALENDAR",
  PROFILE_PREFERENCES_LANGUAGE: "PROFILE_PREFERENCES_LANGUAGE",
  PROFILE_LOGOUT: "PROFILE_LOGOUT",
  PROFILE_FISCAL_CODE: "PROFILE_FISCAL_CODE",
  PROFILE_DOWNLOAD_DATA: "PROFILE_DOWNLOAD_DATA",
  MARKDOWN_PLAYGROUND: "MARKDOWN_PLAYGROUND",
  PROFILE_REMOVE_ACCOUNT_INFO: "PROFILE_REMOVE_ACCOUNT_INFO",
  PROFILE_REMOVE_ACCOUNT_DETAILS: "PROFILE_REMOVE_ACCOUNT_DETAILS",
  PROFILE_REMOVE_ACCOUNT_SUCCESS: "PROFILE_REMOVE_ACCOUNT_SUCCESS",
  PROFILE_PREFERENCES_NOTIFICATIONS: "PROFILE_PREFERENCES_NOTIFICATIONS",

  // Developer Mode
  SHOWROOM: "SHOWROOM",
  WEB_PLAYGROUND: "WEB_PLAYGROUND",
  CGN_LANDING_PLAYGROUND: "CGN_LANDING_PLAYGROUND",

  // Preferences
  READ_EMAIL_SCREEN: "READ_EMAIL_SCREEN",
  INSERT_EMAIL_SCREEN: "INSERT_EMAIL_SCREEN",

  // Used when the App is in background
  BACKGROUND: "BACKGROUND",

  WORKUNIT_GENERIC_FAILURE: "WORKUNIT_GENERIC_FAILURE"
} as const;

export default ROUTES;
