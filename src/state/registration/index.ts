export * from './instruction';
export * from './state';

export const toBytesInt32 = (num: number) => {
  const arr = new Uint8Array([
    (num & 0xff000000) >> 24,
    (num & 0x00ff0000) >> 16,
    (num & 0x0000ff00) >> 8,
    num & 0x000000ff,
  ]);
  return arr;
};

// function toBigEndian(n: number) {
//   return n
//     .toString(16)
//     .match(/[\da-f]/g)
//     .reduceRight(
//       (r, c, i, a) =>
//         (a.length - i) % 2
//           ? r.concat(c)
//           : ((r[r.length - 1] = c + r[r.length - 1]), r),
//       []
//     )
//     .map((s) => (s.length === 1 ? 0 + s : s))
//     .reduce((p, c, i, a) =>
//       i < a.length - 1
//         ? p + ' ' + c
//         : p + ' ' + c + ' 00'.repeat(~~(4 - a.length))
//     );
// }
