// convert a price string into integer cents
function priceToCents(value) {
  if (
    typeof value !== 'string' ||
    !/^\d+(?:\.\d{1,2})?$/.test(value.trim())
  ) {
    throw new Error(
      'perPerson must be a nonnegative price with at most two decimals'
    );
  }

  const [whole, fraction = ''] = value.trim().split('.');

  const cents =
    Number(whole) * 100 +
    Number(fraction.padEnd(2, '0'));

  if (!Number.isSafeInteger(cents)) {
    throw new Error('perPerson is too large');
  }

  return cents;
}

// get the number of days from the existing length text
function lengthToDays(value) {
  if (typeof value !== 'string') {
    throw new Error(
      'length must include a positive number of days'
    );
  }

  const match = value
    .trim()
    .match(/(?:^|\/)\s*(\d+)\s*days?\s*$/i);

  if (
    !match ||
    !Number.isSafeInteger(Number(match[1])) ||
    Number(match[1]) < 1
  ) {
    throw new Error(
      'length must include a positive number of days'
    );
  }

  return Number(match[1]);
}

// normalize resort names for case insensitive prefix searches
function resortToSearch(value) {
  if (
    typeof value !== 'string' ||
    !value.trim()
  ) {
    throw new Error('resort is required');
  }

  return value.trim().toLowerCase();
}

// derive the database fields from the existing trip fields
function normalizeTripValues(trip) {
  return {
    priceCents: priceToCents(trip.perPerson),
    durationDays: lengthToDays(trip.length),
    resortSearch: resortToSearch(trip.resort)
  };
}

module.exports = {
  priceToCents,
  lengthToDays,
  resortToSearch,
  normalizeTripValues
};