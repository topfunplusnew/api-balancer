const ProxyService = require("./proxy-service");

/**
 * 模板配置服务
 * 根据草稿ID获取渲染信息
 */
class TemplateConfigService {
  /**
   * 获取模板配置
   * @returns {Object} modifications
   */
  static async getTemplateConfig(templateId) {
    const result = await ProxyService.proxyRequest(
      "creatomate",
      `v2/renders/${templateId}`,
      "GET",
      null,
      {},
      {}
    );

    const modifications = result?.data?.modifications || {};

    return Object.entries(modifications).map(([key, value]) => ({
      name: key,
      type: "text",
      label: key,
      default: value,
    }));
  }
}

module.exports = TemplateConfigService;

