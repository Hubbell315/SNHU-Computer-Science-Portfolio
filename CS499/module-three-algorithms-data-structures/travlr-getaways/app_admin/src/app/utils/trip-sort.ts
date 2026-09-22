import { Trip } from '../models/trip';

export type TripSortOption =
  | 'default'
  | 'price-asc'
  | 'price-desc'
  | 'duration-asc'
  | 'duration-desc';

type TripComparator = (left: Trip, right: Trip) => number;

function parsePrice(value: string): number {
  const numericValue = Number.parseFloat(value.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(numericValue) ? numericValue : Number.NaN;
}

function parseDurationDays(value: string): number {
  const dayMatch = value.match(/(\d+(?:\.\d+)?)\s*days?/i);

  if (dayMatch) {
    return Number.parseFloat(dayMatch[1]);
  }

  const nightMatch = value.match(/(\d+(?:\.\d+)?)\s*nights?/i);

  if (nightMatch) {
    return Number.parseFloat(nightMatch[1]);
  }

  return Number.NaN;
}

function compareNumericValues(
  leftValue: number,
  rightValue: number,
  direction: 1 | -1,
  leftName: string,
  rightName: string
): number {
  const leftValid = Number.isFinite(leftValue);
  const rightValid = Number.isFinite(rightValue);

  // Invalid numeric values are placed at the end.
  if (!leftValid && !rightValid) {
    return leftName.localeCompare(rightName);
  }

  if (!leftValid) {
    return 1;
  }

  if (!rightValid) {
    return -1;
  }

  const numericComparison = (leftValue - rightValue) * direction;

  return numericComparison !== 0
    ? numericComparison
    : leftName.localeCompare(rightName);
}

function comparatorFor(option: TripSortOption): TripComparator | null {
  switch (option) {
    case 'price-asc':
      return (left, right) =>
        compareNumericValues(
          parsePrice(left.perPerson),
          parsePrice(right.perPerson),
          1,
          left.name,
          right.name
        );

    case 'price-desc':
      return (left, right) =>
        compareNumericValues(
          parsePrice(left.perPerson),
          parsePrice(right.perPerson),
          -1,
          left.name,
          right.name
        );

    case 'duration-asc':
      return (left, right) =>
        compareNumericValues(
          parseDurationDays(left.length),
          parseDurationDays(right.length),
          1,
          left.name,
          right.name
        );

    case 'duration-desc':
      return (left, right) =>
        compareNumericValues(
          parseDurationDays(left.length),
          parseDurationDays(right.length),
          -1,
          left.name,
          right.name
        );

    default:
      return null;
  }
}

function merge(
  left: Trip[],
  right: Trip[],
  compare: TripComparator
): Trip[] {
  const merged: Trip[] = [];

  let leftIndex = 0;
  let rightIndex = 0;

  while (leftIndex < left.length && rightIndex < right.length) {
    if (compare(left[leftIndex], right[rightIndex]) <= 0) {
      merged.push(left[leftIndex]);
      leftIndex += 1;
    } else {
      merged.push(right[rightIndex]);
      rightIndex += 1;
    }
  }

  return merged
    .concat(left.slice(leftIndex))
    .concat(right.slice(rightIndex));
}

function mergeSort(
  trips: Trip[],
  compare: TripComparator
): Trip[] {
  if (trips.length <= 1) {
    return [...trips];
  }

  const middle = Math.floor(trips.length / 2);

  const left = mergeSort(
    trips.slice(0, middle),
    compare
  );

  const right = mergeSort(
    trips.slice(middle),
    compare
  );

  return merge(left, right, compare);
}

// Sorts the Trip[] collection with a custom merge sort instead
// of JavaScript's built-in Array.sort().
//
// Time complexity: O(m log m)
// Space complexity: O(m)
//
// m represents the number of matching trips returned by the API.
export function sortTrips(
  trips: Trip[],
  option: TripSortOption
): Trip[] {
  const compare = comparatorFor(option);

  return compare
    ? mergeSort(trips, compare)
    : [...trips];
}