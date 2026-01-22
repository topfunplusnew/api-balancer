const { StatusCodes } = require("http-status-codes");
const { TemplateConfigService } = require("../services");
/**
 * 模板配置控制器
 */
class TemplateConfigController {
    /**
     * 获取模板配置
     * @route GET /api/v1/template-config
     */
    static async getTemplateConfig(req, res) {
        const config = TemplateConfigService.getTemplateConfig();
        return res.status(StatusCodes.OK).json({
            success: true,
            message: "获取模板配置成功",
            data: config,
            error: {},
        });
    }
}
module.exports = TemplateConfigController;
