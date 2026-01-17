const { StatusCodes } = require("http-status-codes");
const AuthService = require("../services/auth-service");
const { userStore } = require("../utils");

// Mock Supabase
jest.mock("../config", () => ({
  Supabase: {
    from: jest.fn(),
  },
  Logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

const { Supabase } = require("../config");

describe("AuthService测试", () => {
  let mockSupabaseQuery;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // 设置Supabase mock
    mockSupabaseQuery = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      delete: jest.fn().mockReturnThis(),
    };
    Supabase.from.mockReturnValue(mockSupabaseQuery);
  });

  describe("getApiKey方法", () => {
    test("应该成功获取API key", async () => {
      // Mock用户验证成功
      mockSupabaseQuery.single.mockResolvedValue({
        data: {
          username: "testuser",
          password: userStore.hashPassword("testpass"),
        },
        error: null,
      });

      const result = await AuthService.getApiKey("testuser", "testpass");

      expect(result.success).toBe(true);
      expect(result.data.access_key).toBeDefined();
      expect(result.data.access_key).toContain("testuser");
      expect(Supabase.from).toHaveBeenCalledWith("users");
    });

    test("应该拒绝错误的用户名", async () => {
      // Mock用户不存在
      mockSupabaseQuery.single.mockResolvedValue({
        data: null,
        error: { code: "PGRST116" },
      });

      await expect(
        AuthService.getApiKey("wronguser", "testpass")
      ).rejects.toMatchObject({
        statusCode: StatusCodes.UNAUTHORIZED,
        message: "用户名或密码错误",
      });
    });

    test("应该拒绝错误的密码", async () => {
      // Mock用户存在但密码错误
      mockSupabaseQuery.single.mockResolvedValue({
        data: {
          username: "testuser",
          password: userStore.hashPassword("correctpass"),
        },
        error: null,
      });

      await expect(
        AuthService.getApiKey("testuser", "wrongpass")
      ).rejects.toMatchObject({
        statusCode: StatusCodes.UNAUTHORIZED,
        message: "用户名或密码错误",
      });
    });

    test("生成的API key应该是唯一的", async () => {
      const correctPassword = "testpass";
      const hashedPassword = userStore.hashPassword(correctPassword);
      
      mockSupabaseQuery.single.mockResolvedValue({
        data: {
          username: "testuser",
          password: hashedPassword,
        },
        error: null,
      });

      const result1 = await AuthService.getApiKey("testuser", correctPassword);
      
      mockSupabaseQuery.single.mockResolvedValue({
        data: {
          username: "testuser",
          password: hashedPassword,
        },
        error: null,
      });

      const result2 = await AuthService.getApiKey("testuser", correctPassword);

      expect(result1.data.access_key).not.toBe(result2.data.access_key);
    });
  });

  describe("createUser方法", () => {
    test("应该成功创建用户", async () => {
      // Mock hasUser返回false（用户不存在）
      mockSupabaseQuery.single.mockResolvedValueOnce({
        data: null,
        error: { code: "PGRST116" },
      });

      // Mock createUser成功
      const insertQuery = {
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            username: "newuser",
            created_at: new Date(),
          },
          error: null,
        }),
      };
      mockSupabaseQuery.insert.mockReturnValue(insertQuery);

      const user = await AuthService.createUser("newuser", "newpass");

      expect(user.username).toBe("newuser");
      expect(user.createdAt).toBeDefined();
    });

    test("应该拒绝创建已存在的用户", async () => {
      // Mock hasUser返回true（用户已存在）
      mockSupabaseQuery.single.mockResolvedValue({
        data: { username: "existinguser" },
        error: null,
      });

      await expect(
        AuthService.createUser("existinguser", "pass")
      ).rejects.toMatchObject({
        statusCode: StatusCodes.CONFLICT,
        message: "用户已存在",
      });
    });
  });
});
