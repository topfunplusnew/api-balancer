const axios = require("axios");
const { StatusCodes } = require("http-status-codes");

// Mock axios
jest.mock("axios");

// Mock config before requiring ProxyService
jest.mock("../config", () => ({
  ApiConfig: {
    creatomate: {
      baseUrl: "https://api.creatomate.com",
      version: "v2",
      getUrl: (path) => `https://api.creatomate.com/v2/${path}`,
    },
    testapi: {
      baseUrl: "https://api.test.com",
      version: "v1",
      getUrl: (path) => `https://api.test.com/v1/${path}`,
    },
  },
  Logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

const ProxyService = require("../services/proxy-service");

describe("ProxyService测试", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("proxyRequest方法", () => {
    test("应该成功转发GET请求", async () => {
      const mockResponse = {
        status: 200,
        data: { id: "123", status: "success" },
      };
      axios.mockResolvedValue(mockResponse);

      const result = await ProxyService.proxyRequest("creatomate", "renders", "GET");

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse.data);
      expect(result.status).toBe(200);
      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "GET",
          url: "https://api.creatomate.com/v2/renders",
        })
      );
    });

    test("应该成功转发POST请求并包含请求体", async () => {
      const mockResponse = {
        status: 201,
        data: { id: "456", created: true },
      };
      const requestData = { template_id: "123", modifications: {} };
      axios.mockResolvedValue(mockResponse);

      const result = await ProxyService.proxyRequest(
        "creatomate",
        "renders",
        "POST",
        requestData
      );

      expect(result.success).toBe(true);
      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "POST",
          url: "https://api.creatomate.com/v2/renders",
          data: requestData,
        })
      );
    });

    test("应该转发自定义请求头", async () => {
      const mockResponse = { status: 200, data: {} };
      axios.mockResolvedValue(mockResponse);
      const customHeaders = { Authorization: "Bearer token123" };

      await ProxyService.proxyRequest("creatomate", "renders", "GET", null, customHeaders);

      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer token123",
          }),
        })
      );
    });

    test("应该转发查询参数", async () => {
      const mockResponse = { status: 200, data: {} };
      axios.mockResolvedValue(mockResponse);
      const params = { page: 1, limit: 10 };

      await ProxyService.proxyRequest("creatomate", "renders", "GET", null, {}, params);

      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          params,
        })
      );
    });

    test("应该处理API配置不存在的情况", async () => {
      await expect(
        ProxyService.proxyRequest("nonexistent", "endpoint", "GET")
      ).rejects.toMatchObject({
        statusCode: StatusCodes.BAD_REQUEST,
        message: "API配置不存在: nonexistent",
      });
    });

    test("应该处理API返回错误响应", async () => {
      const errorResponse = {
        response: {
          status: 404,
          data: { message: "Not Found" },
        },
      };
      axios.mockRejectedValue(errorResponse);

      await expect(
        ProxyService.proxyRequest("creatomate", "renders", "GET")
      ).rejects.toMatchObject({
        statusCode: 404,
        message: "Not Found",
        data: { message: "Not Found" },
      });
    });

    test("应该处理网络错误", async () => {
      const networkError = {
        request: {},
        message: "Network Error",
      };
      axios.mockRejectedValue(networkError);

      await expect(
        ProxyService.proxyRequest("creatomate", "renders", "GET")
      ).rejects.toMatchObject({
        statusCode: StatusCodes.BAD_GATEWAY,
        message: "无法连接到目标API服务器",
      });
    });

    test("应该处理其他错误", async () => {
      const otherError = {
        message: "Unknown error",
      };
      axios.mockRejectedValue(otherError);

      await expect(
        ProxyService.proxyRequest("creatomate", "renders", "GET")
      ).rejects.toMatchObject({
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Unknown error",
      });
    });

    test("应该支持PUT和PATCH方法", async () => {
      const mockResponse = { status: 200, data: {} };
      axios.mockResolvedValue(mockResponse);
      const requestData = { name: "updated" };

      await ProxyService.proxyRequest("creatomate", "renders/123", "PUT", requestData);
      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "PUT",
          data: requestData,
        })
      );

      await ProxyService.proxyRequest("creatomate", "renders/123", "PATCH", requestData);
      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "PATCH",
          data: requestData,
        })
      );
    });

    test("GET请求不应该包含data字段", async () => {
      const mockResponse = { status: 200, data: {} };
      axios.mockResolvedValue(mockResponse);

      await ProxyService.proxyRequest("creatomate", "renders", "GET", { test: "data" });

      const callArgs = axios.mock.calls[0][0];
      expect(callArgs.data).toBeUndefined();
    });

    test("应该成功转发Creatomate视频渲染请求", async () => {
      const mockResponse = {
        status: 200,
        data: {
          id: "render-123",
          status: "pending",
          output_url: "https://example.com/video.mp4",
        },
      };
      const renderRequest = {
        output_format: "mp4",
        width: 1280,
        height: 720,
        duration: 3,
        elements: [
          {
            type: "text",
            text: "My first video generated with RenderScript!",
            fill_color: "#ff0000",
            width: "50%",
            height: "25%",
          },
        ],
      };
      axios.mockResolvedValue(mockResponse);

      const result = await ProxyService.proxyRequest(
        "creatomate",
        "renders",
        "POST",
        renderRequest,
        { Authorization: "Bearer 52181a0602234279b50469837027e68c06a2922dfc920a4a888288acf1c5c7aed9aa22d212b8f3efa7542fdc8ab79e9e" }
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse.data);
      expect(result.status).toBe(200);
      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "POST",
          url: "https://api.creatomate.com/v2/renders",
          data: renderRequest,
          headers: expect.objectContaining({
            Authorization: "Bearer 52181a0602234279b50469837027e68c06a2922dfc920a4a888288acf1c5c7aed9aa22d212b8f3efa7542fdc8ab79e9e",
            "Content-Type": "application/json",
          }),
        })
      );
    });
  });
});
