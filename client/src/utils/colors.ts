export const USER_COLORS = [
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#F97316', // Orange
];

export const getRandomColor = (): string => {
    return USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
};