export function validate(schema) {
  return (req, _res, next) => {
    const parsed = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query
    });

    if (!parsed.success) {
      const message = parsed.error.issues.map((issue) => issue.message).join(", ");
      return next(Object.assign(new Error(message), { statusCode: 400 }));
    }

    req.validated = parsed.data;
    next();
  };
}
