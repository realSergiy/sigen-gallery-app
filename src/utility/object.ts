type SimpleObject = Record<string, string>;

export const areSimpleObjectsEqual = (object1: SimpleObject, object2: SimpleObject): boolean => {
  const object1Keys = Object.keys(object1);
  const object2Keys = Object.keys(object2);

  return object1Keys.length === object2Keys.length
    ? object1Keys.every(key => object1[key] === object2[key])
    : false;
};
