export const isChronological = (years: readonly number[]): boolean =>
  years.length === 10 && years.every((year, index) => year === 2017 + index);

export const orderedTimelineAfterDrop = (years: readonly number[], draggedYear: number, targetYear: number): number[] => {
  const withoutDragged = years.filter((year) => year !== draggedYear);
  const targetIndex = withoutDragged.indexOf(targetYear);
  return targetIndex < 0 ? [...years] : [...withoutDragged.slice(0, targetIndex), draggedYear, ...withoutDragged.slice(targetIndex)];
};
