module.exports = {
  check: (req, res, next) => {
    const {
      params: { activity_id },
    } = req;

    // + https://stackoverflow.com/questions/71257514/check-for-pattern-match-with-uuidv4-in-javascript/71258097#71258097
    const regexExp = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}(?:\/.*)?$/i;
    if(!regexExp.test(activity_id)) {
      return res.status(400).json({
        code: "ERROR_CODE_INPUT_ERROR",
        message: "Not a valid UUID.",
        payload: {
          param: "activity_id"
        }
      });
    }

    next();
  }
}
