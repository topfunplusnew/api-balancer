const { apiKeyStore } = require("../utils");

describe("ApiKeyStore测试", () => {
  beforeEach(() => {
    apiKeyStore.clear();
  });

  test("应该能够设置和获取API key", () => {
    const accessKey = "test_access_key";
    const secretKey = "test_secret_key";

    apiKeyStore.set(accessKey, secretKey);

    expect(apiKeyStore.get(accessKey)).toBe(secretKey);
    expect(apiKeyStore.has(accessKey)).toBe(true);
  });

  test("应该能够检查API key是否存在", () => {
    const accessKey = "test_access_key";
    const secretKey = "test_secret_key";

    expect(apiKeyStore.has(accessKey)).toBe(false);

    apiKeyStore.set(accessKey, secretKey);

    expect(apiKeyStore.has(accessKey)).toBe(true);
  });

  test("应该能够删除API key", () => {
    const accessKey = "test_access_key";
    const secretKey = "test_secret_key";

    apiKeyStore.set(accessKey, secretKey);
    expect(apiKeyStore.has(accessKey)).toBe(true);

    const deleted = apiKeyStore.delete(accessKey);
    expect(deleted).toBe(true);
    expect(apiKeyStore.has(accessKey)).toBe(false);
    expect(apiKeyStore.get(accessKey)).toBeUndefined();
  });

  test("应该能够清空所有API key", () => {
    apiKeyStore.set("key1", "secret1");
    apiKeyStore.set("key2", "secret2");

    expect(apiKeyStore.has("key1")).toBe(true);
    expect(apiKeyStore.has("key2")).toBe(true);

    apiKeyStore.clear();

    expect(apiKeyStore.has("key1")).toBe(false);
    expect(apiKeyStore.has("key2")).toBe(false);
  });

  test("获取不存在的API key应该返回undefined", () => {
    expect(apiKeyStore.get("non_existent_key")).toBeUndefined();
  });

  test("应该支持多个API key", () => {
    apiKeyStore.set("key1", "secret1");
    apiKeyStore.set("key2", "secret2");
    apiKeyStore.set("key3", "secret3");

    expect(apiKeyStore.get("key1")).toBe("secret1");
    expect(apiKeyStore.get("key2")).toBe("secret2");
    expect(apiKeyStore.get("key3")).toBe("secret3");
  });
});
