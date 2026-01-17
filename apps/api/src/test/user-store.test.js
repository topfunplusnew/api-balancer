const { userStore } = require("../utils");

// Mock Supabase
jest.mock("../config", () => ({
  Supabase: {
    from: jest.fn(),
  },
  Logger: {
    error: jest.fn(),
  },
}));

const { Supabase } = require("../config");

describe("UserStore测试", () => {
  let mockSupabaseQuery;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockSupabaseQuery = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      delete: jest.fn().mockReturnThis(),
    };
    Supabase.from.mockReturnValue(mockSupabaseQuery);
  });

  describe("createUser方法", () => {
    test("应该成功创建用户", async () => {
      const insertQuery = {
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            username: "testuser",
            created_at: new Date(),
          },
          error: null,
        }),
      };
      mockSupabaseQuery.insert.mockReturnValue(insertQuery);

      const user = await userStore.createUser("testuser", "password");

      expect(user.username).toBe("testuser");
      expect(user.createdAt).toBeDefined();
      expect(Supabase.from).toHaveBeenCalledWith("users");
    });

    test("应该拒绝创建已存在的用户", async () => {
      const insertQuery = {
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: {
            code: "23505",
            message: "duplicate key value",
          },
        }),
      };
      mockSupabaseQuery.insert.mockReturnValue(insertQuery);

      await expect(
        userStore.createUser("existinguser", "pass")
      ).rejects.toMatchObject({
        statusCode: 409,
        message: "用户已存在",
      });
    });
  });

  describe("verifyUser方法", () => {
    test("应该成功验证用户", async () => {
      const password = "testpass";
      const hashedPassword = userStore.hashPassword(password);

      mockSupabaseQuery.single.mockResolvedValue({
        data: {
          username: "testuser",
          password: hashedPassword,
        },
        error: null,
      });

      const isValid = await userStore.verifyUser("testuser", password);

      expect(isValid).toBe(true);
    });

    test("应该拒绝错误的密码", async () => {
      mockSupabaseQuery.single.mockResolvedValue({
        data: {
          username: "testuser",
          password: userStore.hashPassword("correctpass"),
        },
        error: null,
      });

      const isValid = await userStore.verifyUser("testuser", "wrongpass");

      expect(isValid).toBe(false);
    });

    test("应该拒绝不存在的用户", async () => {
      mockSupabaseQuery.single.mockResolvedValue({
        data: null,
        error: { code: "PGRST116" },
      });

      const isValid = await userStore.verifyUser("nonexistent", "pass");

      expect(isValid).toBe(false);
    });
  });

  describe("hasUser方法", () => {
    test("应该检查用户是否存在", async () => {
      mockSupabaseQuery.single.mockResolvedValue({
        data: { username: "testuser" },
        error: null,
      });

      const exists = await userStore.hasUser("testuser");

      expect(exists).toBe(true);
    });

    test("应该返回false当用户不存在", async () => {
      mockSupabaseQuery.single.mockResolvedValue({
        data: null,
        error: { code: "PGRST116" },
      });

      const exists = await userStore.hasUser("nonexistent");

      expect(exists).toBe(false);
    });
  });

  describe("deleteUser方法", () => {
    test("应该成功删除用户", async () => {
      const deleteQuery = {
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      };
      mockSupabaseQuery.delete.mockReturnValue(deleteQuery);

      const deleted = await userStore.deleteUser("testuser");

      expect(deleted).toBe(true);
      expect(Supabase.from).toHaveBeenCalledWith("users");
    });

    test("应该处理删除失败", async () => {
      const deleteQuery = {
        eq: jest.fn().mockResolvedValue({
          error: { message: "Delete failed" },
        }),
      };
      mockSupabaseQuery.delete.mockReturnValue(deleteQuery);

      const deleted = await userStore.deleteUser("testuser");

      expect(deleted).toBe(false);
    });
  });

  describe("hashPassword方法", () => {
    test("应该正确加密密码", () => {
      const password = "testpass";
      const hash1 = userStore.hashPassword(password);
      const hash2 = userStore.hashPassword(password);

      expect(hash1).toBe(hash2);
      expect(hash1).not.toBe(password);
      expect(hash1.length).toBe(64); // SHA256 produces 64 char hex string
    });

    test("不同密码应该产生不同的hash", () => {
      const hash1 = userStore.hashPassword("pass1");
      const hash2 = userStore.hashPassword("pass2");

      expect(hash1).not.toBe(hash2);
    });
  });
});
