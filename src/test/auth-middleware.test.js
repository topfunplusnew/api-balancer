const { StatusCodes } = require("http-status-codes");
const authMiddleware = require("../middlewares/auth-middleware");
const { apiKeyStore } = require("../utils");

// Mock Logger
jest.mock("../config", () => ({
  Logger: {
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe("authMiddleware测试", () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    jest.clearAllMocks();
    apiKeyStore.clear();

    mockReq = {
      headers: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  test("应该通过有效的API key", () => {
    const accessKey = "test_access_key";
    const username = "testuser";
    apiKeyStore.set(accessKey, username);

    mockReq.headers.authorization = `Bearer ${accessKey}`;

    authMiddleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.apiKey).toEqual({
      access_key: accessKey,
      username: username,
    });
  });

  test("应该拒绝缺少Authorization请求头", () => {
    authMiddleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: "缺少Authorization请求头",
      error: {},
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  test("应该拒绝格式错误的Authorization", () => {
    mockReq.headers.authorization = "InvalidFormat";

    authMiddleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: "Authorization格式错误，应为: Bearer {access_key}",
      error: {},
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  test("应该拒绝空的API key", () => {
    mockReq.headers.authorization = "Bearer ";

    authMiddleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: "API key不能为空",
      error: {},
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  test("应该拒绝无效的API key", () => {
    mockReq.headers.authorization = "Bearer invalid_key";

    authMiddleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: "无效的API key",
      error: {},
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  test("应该处理中间件内部错误", () => {
    // 模拟一个会导致错误的情况
    mockReq.headers.authorization = null;
    // 强制触发错误
    Object.defineProperty(mockReq.headers, "authorization", {
      get() {
        throw new Error("Test error");
      },
    });

    authMiddleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: "鉴权验证失败",
      error: {},
    });
    expect(mockNext).not.toHaveBeenCalled();
  });
});
