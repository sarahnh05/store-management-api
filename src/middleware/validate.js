export const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    // console.log('result', result);

    if (!result.success) {
      return res.status(400).json({
        message: result.error.issues[0].message,
      });
    }
    req.validatedData = result.data;

    // console.log('validate 1', req.validatedData);
    // console.log('result.data', result.data);

    next();
  };
};
