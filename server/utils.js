export const isEmpty = fieldValue => {
  return !(fieldValue.trim().length === 0);
};

export const handleError = ({ errors }, res) => {
  const modelErrors = Object.keys(errors);

  const message = errors[modelErrors.shift()].message;
  return res.status(400).send({
    message,
  });
};
