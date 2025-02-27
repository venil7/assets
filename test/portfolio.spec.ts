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
  const createPortfolio = methods.post<Portfolio>(PORTFOLIO_URL, {
    name: "test-name",
    description: "some description",
  });
  const { id, user_id, name, description, created, modified } = await run(
    createPortfolio
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
