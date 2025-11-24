export const roundPrice = (price: number, roundingValue: number): number => {
    return Math.ceil(price / roundingValue) * roundingValue;
};