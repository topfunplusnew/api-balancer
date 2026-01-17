/**
 * API配置测试
 */
describe("API配置测试", () => {
  beforeEach(() => {
    // 清除所有API相关的环境变量
    Object.keys(process.env).forEach((key) => {
      if (key.startsWith("API_")) {
        delete process.env[key];
      }
    });
    // 重置模块缓存
    jest.resetModules();
  });


  test("应该正确解析Creatomate API配置", () => {
    process.env.API_CREATOMATE_BASE_URL = "https://api.creatomate.com";
    process.env.API_CREATOMATE_VERSION = "v2";

    const ApiConfig = require("../config/api-config");

    expect(ApiConfig.creatomate).toBeDefined();
    expect(ApiConfig.creatomate.baseUrl).toBe("https://api.creatomate.com");
    expect(ApiConfig.creatomate.version).toBe("v2");
  });

  test("getUrl应该正确构建完整URL", () => {
    process.env.API_CREATOMATE_BASE_URL = "https://api.creatomate.com";
    process.env.API_CREATOMATE_VERSION = "v2";

    const ApiConfig = require("../config/api-config");

    expect(ApiConfig.creatomate.getUrl("renders")).toBe("https://api.creatomate.com/v2/renders");
    expect(ApiConfig.creatomate.getUrl("/renders")).toBe("https://api.creatomate.com/v2/renders");
    expect(ApiConfig.creatomate.getUrl("renders/123")).toBe("https://api.creatomate.com/v2/renders/123");
  });

  test("getUrl应该处理空路径", () => {
    process.env.API_CREATOMATE_BASE_URL = "https://api.creatomate.com";
    process.env.API_CREATOMATE_VERSION = "v2";

    const ApiConfig = require("../config/api-config");

    expect(ApiConfig.creatomate.getUrl("")).toBe("https://api.creatomate.com/v2");
    expect(ApiConfig.creatomate.getUrl()).toBe("https://api.creatomate.com/v2");
  });

  test("getUrl应该处理没有version的情况", () => {
    process.env.API_TESTAPI_BASE_URL = "https://api.test.com";
    // 不设置version

    const ApiConfig = require("../config/api-config");

    expect(ApiConfig.testapi).toBeDefined();
    expect(ApiConfig.testapi.getUrl("endpoint")).toBe("https://api.test.com/endpoint");
    expect(ApiConfig.testapi.getUrl("")).toBe("https://api.test.com");
  });

  test("应该支持多个API配置", () => {
    process.env.API_CREATOMATE_BASE_URL = "https://api.creatomate.com";
    process.env.API_CREATOMATE_VERSION = "v2";
    process.env.API_ANOTHERAPI_BASE_URL = "https://api.another.com";
    process.env.API_ANOTHERAPI_VERSION = "v1";

    const ApiConfig = require("../config/api-config");

    expect(ApiConfig.creatomate).toBeDefined();
    expect(ApiConfig.anotherapi).toBeDefined();
    expect(ApiConfig.creatomate.baseUrl).toBe("https://api.creatomate.com");
    expect(ApiConfig.anotherapi.baseUrl).toBe("https://api.another.com");
  });

  test("应该处理baseUrl末尾的斜杠", () => {
    process.env.API_TESTAPI_BASE_URL = "https://api.test.com/";
    process.env.API_TESTAPI_VERSION = "v1";

    const ApiConfig = require("../config/api-config");

    expect(ApiConfig.testapi).toBeDefined();
    expect(ApiConfig.testapi.getUrl("endpoint")).toBe("https://api.test.com/v1/endpoint");
  });

  test("API名称应该转换为小写", () => {
    process.env.API_MYAPI_BASE_URL = "https://api.myapi.com";
    process.env.API_MYAPI_VERSION = "v1";

    const ApiConfig = require("../config/api-config");

    expect(ApiConfig.myapi).toBeDefined();
    expect(ApiConfig.MYAPI).toBeUndefined();
  });
});
