// A listing gets the "New" badge for its first 7 days.
export function getBadgeForProperty(property) {
  if (!property) return { showBadge: false, badgeType: "new" };

  const created = property.created_at || property.created_date;
  if (created) {
    const age = Date.now() - new Date(created).getTime();
    if (age >= 0 && age < 7 * 24 * 60 * 60 * 1000) {
      return { showBadge: true, badgeType: "new" };
    }
  }
  return { showBadge: false, badgeType: "new" };
}
