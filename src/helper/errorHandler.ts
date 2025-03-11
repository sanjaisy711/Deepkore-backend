export const handleCatchError = (e: any): string => {
  if (e.message) {
    return e.message;
  } else {
    return e;
  }
};
