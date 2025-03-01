import { beforeAll, expect, test } from "bun:test";
import { authenticate, BASE_URL, run, type Methods } from "./index";

export const PORTFOLIO_URL = `${BASE_URL}/api/v1/portfolio`;

var methods: Methods;

export type Portfolio = {
  id?: number;
  user_id?: number;
  name: string;
  description: string;
  created?: string;
  modified?: string;
};

beforeAll(async () => {
  methods = await run(authenticate());
});

test("Create portfolio", async () => {
  const { id, user_id, name, description, created, modified } = await run(
    methods.post<Portfolio>(PORTFOLIO_URL, {
      name: "test-name",
      description: "some description",
    })
  );
  expect(id).toBeNumber();
  expect(user_id).toBeNumber();
  expect(name).toBe("test-name");
  expect(description).toBe("some description");
  expect(created).toBeString();
  expect(modified).toBeString();
});

test("Get multiple portfolios", async () => {
  const portfolios = await run(methods.get<Portfolio[]>(PORTFOLIO_URL));
  expect(portfolios).toSatisfy((a) => Array.isArray(a) && a.length > 0);
});

test("Get single portfolio", async () => {
  const { id, user_id, name, description, created, modified } = await run(
    methods.get<Portfolio>(`${PORTFOLIO_URL}/1`)
  );
  expect(id).toBeNumber();
  expect(user_id).toBeNumber();
  expect(name).toBeString();
  expect(description).toBeString();
  expect(created).toBeString();
  expect(modified).toBeString();
});

test("Delete portfolio", async () => {
  const { id } = await run(
    methods.post<Portfolio>(PORTFOLIO_URL, {
      name: "portfolio-to-delete",
      description: "---",
    })
  );

  const deleted = await run(methods.delete<boolean>(`${PORTFOLIO_URL}/${id}`));
  expect(deleted).toBeTrue();
});
