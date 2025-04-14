import { test } from "bun:test";
import { Heap } from "heap-js";
import type { ArrayItem, ChartData } from "../src";

type Asset = {
  name: string;
  weight: number;
  points: ChartData;
  first: number;
  last: number;
};
type Point = ArrayItem<Asset["points"]>;

const combine = (as: Asset[]): Point[] => {
  const heap = new Heap<{ point: Point; name: string }>(
    (a, b) => a.point.timestamp - b.point.timestamp
  );
  heap.init();
  as.forEach((a) =>
    heap.addAll(a.points.map((p) => ({ point: p, name: a.name } as const)))
  );
  // const assetCount = as.length;
  const assetNames = as.map((a) => a.name);
  const assetDict = new Map(as.map((a) => [a.name, a]));

  const points = [] as unknown as ChartData;

  while (heap.length) {
    const set = new Set(assetNames);
    const { point, name } = heap.pop()!;
    set.delete(name);
    while (true /*chunk.length < assetCount*/) {
      if (!heap.length) break;
      if (heap.peek()!.point.timestamp == point.timestamp) {
        const {
          point: { price, volume },
          name,
        } = heap.pop()!;
        point.price += price;
        point.volume += volume;
        set.delete(name);
      } else break;
    }
    set.forEach((name) => {
      point.price += assetDict.get(name)!.first;
      // point.volume += assetDict.get(name)!.volume
    });

    points.push(point);
  }
  return points;
};

test("heap", () => {});
