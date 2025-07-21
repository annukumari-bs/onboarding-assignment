export const truncateQuantity = (quantity) => {
    if (quantity >= 1000) {
      return '999+';
    }
    return quantity;
  };