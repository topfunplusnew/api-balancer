const { StatusCodes } = require("http-status-codes");
const AuthController = require("../controllers/auth-controller");
const { AuthService } = require("../services");
const { apiKeyStore } = require("../utils");

// Mock AuthService
jest.mock("../services", () => ({
  AuthService: {
    getApiKey: jest.fn(),
  },
}));

// Mock Logger
jest.mock("../config", () => ({
  Logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe("AuthController测试", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    apiKeyStore.clear();

    mockReq = {
      body: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe("getApiKey方法", () => {
    test("应该成功获取API key", async () => {
      mockReq.body = {
        username: "testuser",
        password: "testpass",
      };
      const mockResult = {
        success: true,
        data: {
          access_key: "test_access_key",
        },
      };
      AuthService.getApiKey.mockResolvedValue(mockResult);

      await AuthController.getApiKey(mockReq, mockRes);

      expect(AuthService.getApiKey).toHaveBeenCalledWith("testuser", "testpass");
      expect(apiKeyStore.has("test_access_key")).toBe(true);
      expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          access_key: "test_access_key",
          message: "API key已生成，请使用access_key作为Bearer token进行鉴权",
        },
      });
    });

    test("应该处理缺少必填字段", async () => {
      mockReq.body = {
        username: "testuser",
        // 缺少password
      };

      await AuthController.getApiKey(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "缺少必填字段: username 和 password",
        error: {},
      });
    });

    test("应该处理用户名或密码错误", async () => {
      mockReq.body = {
        username: "testuser",
        password: "wrongpass",
      };
      const error = {
        statusCode: StatusCodes.UNAUTHORIZED,
        message: "用户名或密码错误",
      };
      AuthService.getApiKey.mockRejectedValue(error);

      await AuthController.getApiKey(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "用户名或密码错误",
        error: {},
      });
    });

    test("应该处理API key生成失败", async () => {
      mockReq.body = {
        username: "testuser",
        password: "testpass",
      };
      const mockResult = {
        success: true,
        data: {
          // 缺少access_key
        },
      };
      AuthService.getApiKey.mockResolvedValue(mockResult);

      await AuthController.getApiKey(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "API key生成失败",
        error: {},
      });
    });
  });
});
