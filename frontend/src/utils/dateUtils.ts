export const formatDate = (
  dateString: string,
  options?: Intl.DateTimeFormatOptions
) => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };

  const formatOptions: Intl.DateTimeFormatOptions = {
    ...defaultOptions,
    ...options,
  };

  const date = new Date(dateString);

  if (options && (options.hour || options.minute || options.second)) {
    return date.toLocaleString('en-GB', formatOptions);
  }

  return date.toLocaleDateString('en-GB', formatOptions);
};
