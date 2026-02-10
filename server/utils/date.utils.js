exports.addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

exports.addMonths = (date, months) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

exports.diffInDays = (start, end) => {
  return Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
};
