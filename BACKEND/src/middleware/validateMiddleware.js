import { sendError } from "../utils/response.js";

export const validate = (schema, source = "body") => {
  return (req, res, next) => {
    try {
      const dataToValidate = req[source];
      const parsed = schema.safeParse(dataToValidate);

      if (!parsed.success) {
        const errors = parsed.error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        return sendError(res, 400, "Validation error", errors);
      }

      req[source] = parsed.data;
      next();
    } catch (error) {
      return sendError(res, 400, "Invalid request payload", [error.message]);
    }
  };
};

