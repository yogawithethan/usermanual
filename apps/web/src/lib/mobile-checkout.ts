const defaultSuccessReturnTo = "usermanual://checkout/success";
const defaultCancelReturnTo = "usermanual://checkout/cancel";

export function allowedMobileCheckoutReturnTo(value: string | null) {
  if (value === defaultSuccessReturnTo || value === defaultCancelReturnTo) {
    return true;
  }

  return Boolean(
    process.env.USER_MANUAL_MOBILE_CHECKOUT_RETURN_TO &&
      value === process.env.USER_MANUAL_MOBILE_CHECKOUT_RETURN_TO,
  );
}

export function defaultMobileCheckoutReturnTo(status: "cancel" | "success") {
  return status === "cancel" ? defaultCancelReturnTo : defaultSuccessReturnTo;
}
