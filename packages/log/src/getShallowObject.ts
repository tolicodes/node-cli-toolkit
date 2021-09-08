const isMap = (data: any) => {
  return (
    typeof data === "object" &&
    data !== undefined &&
    data !== null &&
    Object.getOwnPropertyNames(data).length > 0
  );
};

// it's not a map or array,
const isPrimitiveish = (val: any) => {
  return !isMap(val) && !Array.isArray(val);
};

const getShallowObject = (data: any, {
  extractKeys,
  depth = 1,
  ignoreArrays = false,
  maxArrayLength,
}: {
  extractKeys?: string[],
  depth?: number
  ignoreArrays?: boolean
  maxArrayLength?: number
} = {}): any => {
  // if it's a primitive, just return it
  if (isPrimitiveish(data)) return data;

  // if it's not a primitive and we are at depth 0, we are done
  if (depth === 0) return;

  // in future recursions (non nests), we should ignore arrays if we are at a depth of
  // 1 or 0. Otherwise we will map over them
  const ignoreArraysInRecursions = depth === 1;

  // if our object is an array, we will apply the shallow object
  // logic to it, but ignore any arrays it may have inside if we are at
  // nest level 1
  if (Array.isArray(data)) {
    // if we are ignoring arrays just return undefined
    if (ignoreArrays) return;

    const truncArray = maxArrayLength ? data.slice(0, maxArrayLength) : data;

    return truncArray.map((el) =>
      getShallowObject(el,{
        depth,
        ignoreArrays: ignoreArraysInRecursions,
        extractKeys
      })
    );
  }

  // if it's not a map, primitive array, just return undefined
  if (!isMap(data)) return;

  type ShallowMap = {
    [key: string]: any;
  };

  const shallowMap: ShallowMap = {};

  // go through the object and extract only primitives, and possibly
  // maps and arrays if we are on nest level 2+
  for (const key in data) {
    // if we extract only certain fields
    if (extractKeys && !extractKeys.includes(key)) {
      continue;
    }

    const val = data[key];

    // we can apply the same logic but by decrementing the depth
    // if the depth becomes 0, it will only return primitives
    // if the depth becomes 1, it will work as usual, but ignore
    // nested arrays
    // if the depth becomes 2+ it will work as usual
    const shallowVal = getShallowObject(
      val,
      {
        depth: depth - 1,
        ignoreArrays: ignoreArraysInRecursions,
        extractKeys,
      }
    );

    // if we get undefined (it's not a primitive and we're at level 0), just don't add that key
    if (shallowVal === undefined) continue;

    // otherwise we add it
    shallowMap[key] = shallowVal;
  }

  return shallowMap;
};

export default getShallowObject;
