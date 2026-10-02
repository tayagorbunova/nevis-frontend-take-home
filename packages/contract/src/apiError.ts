export type ApiErrorBody = {
  error: {
    code: "invalid_period" | "internal_error";
    message: string;
  };
};
