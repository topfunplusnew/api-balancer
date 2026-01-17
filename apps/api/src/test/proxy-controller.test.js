const { StatusCodes } = require("http-status-codes");
const ProxyController = require("../controllers/proxy-controller");
const { ProxyService } = require("../services");

// Mock ProxyService
jest.mock("../services", () => ({
  ProxyService: {
    proxyRequest: jest.fn(),
  },
}));

describe("ProxyController测试", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      params: {},
      method: "GET",
      body: {},
      headers: {},
      query: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe("creatomateProxy方法", () => {
    test("应该成功转发GET请求", async () => {
      mockReq.params = { path: "renders" };
      mockReq.method = "GET";
      const mockResult = {
        success: true,
        data: { id: "123" },
        status: 200,
      };
      ProxyService.proxyRequest.mockResolvedValue(mockResult);

      await ProxyController.creatomateProxy(mockReq, mockRes);

      expect(ProxyService.proxyRequest).toHaveBeenCalledWith(
        "creatomate",
        "renders",
        "GET",
        null,
        {},
        {}
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult.data,
      });
    });

    test("应该成功转发POST请求", async () => {
      mockReq.params = { path: "renders" };
      mockReq.method = "POST";
      mockReq.body = { template_id: "123" };
      const mockResult = {
        success: true,
        data: { id: "456" },
        status: 201,
      };
      ProxyService.proxyRequest.mockResolvedValue(mockResult);

      await ProxyController.creatomateProxy(mockReq, mockRes);

      expect(ProxyService.proxyRequest).toHaveBeenCalledWith(
        "creatomate",
        "renders",
        "POST",
        { template_id: "123" },
        {},
        {}
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    test("应该转发Authorization请求头", async () => {
      mockReq.params = { path: "renders" };
      mockReq.headers.authorization = "Bearer token123";
      const mockResult = { success: true, data: {}, status: 200 };
      ProxyService.proxyRequest.mockResolvedValue(mockResult);

      await ProxyController.creatomateProxy(mockReq, mockRes);

      expect(ProxyService.proxyRequest).toHaveBeenCalledWith(
        "creatomate",
        "renders",
        "GET",
        null,
        { Authorization: "Bearer token123" },
        {}
      );
    });

    test("应该转发查询参数", async () => {
      mockReq.params = { path: "renders" };
      mockReq.query = { page: 1, limit: 10 };
      const mockResult = { success: true, data: {}, status: 200 };
      ProxyService.proxyRequest.mockResolvedValue(mockResult);

      await ProxyController.creatomateProxy(mockReq, mockRes);

      expect(ProxyService.proxyRequest).toHaveBeenCalledWith(
        "creatomate",
        "renders",
        "GET",
        null,
        {},
        { page: 1, limit: 10 }
      );
    });

    test("应该处理空请求体", async () => {
      mockReq.params = { path: "renders" };
      mockReq.method = "POST";
      mockReq.body = {};
      const mockResult = { success: true, data: {}, status: 200 };
      ProxyService.proxyRequest.mockResolvedValue(mockResult);

      await ProxyController.creatomateProxy(mockReq, mockRes);

      expect(ProxyService.proxyRequest).toHaveBeenCalledWith(
        "creatomate",
        "renders",
        "POST",
        null,
        {},
        {}
      );
    });

    test("应该处理错误响应", async () => {
      mockReq.params = { path: "renders" };
      const error = {
        statusCode: 404,
        message: "Not Found",
        data: { error: "Resource not found" },
      };
      ProxyService.proxyRequest.mockRejectedValue(error);

      await ProxyController.creatomateProxy(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Not Found",
        error: { error: "Resource not found" },
      });
    });

    test("应该处理没有statusCode的错误", async () => {
      mockReq.params = { path: "renders" };
      const error = {
        message: "Unknown error",
      };
      ProxyService.proxyRequest.mockRejectedValue(error);

      await ProxyController.creatomateProxy(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    });

    test("应该成功转发Creatomate视频渲染请求", async () => {
      mockReq.params = { path: "renders" };
      mockReq.method = "POST";
      mockReq.body = {
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
      mockReq.headers.authorization = "Bearer 52181a0602234279b50469837027e68c06a2922dfc920a4a888288acf1c5c7aed9aa22d212b8f3efa7542fdc8ab79e9e";
      const mockResult = {
        success: true,
        data: {
          id: "render-123",
          status: "pending",
          output_url: "https://example.com/video.mp4",
        },
        status: 200,
      };
      ProxyService.proxyRequest.mockResolvedValue(mockResult);

      await ProxyController.creatomateProxy(mockReq, mockRes);

      expect(ProxyService.proxyRequest).toHaveBeenCalledWith(
        "creatomate",
        "renders",
        "POST",
        mockReq.body,
        { Authorization: "Bearer 52181a0602234279b50469837027e68c06a2922dfc920a4a888288acf1c5c7aed9aa22d212b8f3efa7542fdc8ab79e9e" },
        {}
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult.data,
      });
    });
  });

  describe("genericProxy方法", () => {
    test("应该使用动态API名称转发请求", async () => {
      mockReq.params = { apiName: "testapi", path: "endpoint" };
      mockReq.method = "GET";
      const mockResult = {
        success: true,
        data: { result: "success" },
        status: 200,
      };
      ProxyService.proxyRequest.mockResolvedValue(mockResult);

      await ProxyController.genericProxy(mockReq, mockRes);

      expect(ProxyService.proxyRequest).toHaveBeenCalledWith(
        "testapi",
        "endpoint",
        "GET",
        null,
        {},
        {}
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult.data,
      });
    });

    test("应该转发POST请求到动态API", async () => {
      mockReq.params = { apiName: "anotherapi", path: "create" };
      mockReq.method = "POST";
      mockReq.body = { name: "test" };
      const mockResult = {
        success: true,
        data: { id: "789" },
        status: 201,
      };
      ProxyService.proxyRequest.mockResolvedValue(mockResult);

      await ProxyController.genericProxy(mockReq, mockRes);

      expect(ProxyService.proxyRequest).toHaveBeenCalledWith(
        "anotherapi",
        "create",
        "POST",
        { name: "test" },
        {},
        {}
      );
    });

    test("应该处理错误响应", async () => {
      mockReq.params = { apiName: "testapi", path: "endpoint" };
      const error = {
        statusCode: 500,
        message: "Internal Server Error",
        data: {},
      };
      ProxyService.proxyRequest.mockRejectedValue(error);

      await ProxyController.genericProxy(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Internal Server Error",
        error: {},
      });
    });
  });
});
