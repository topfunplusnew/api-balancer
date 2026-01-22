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
        const templateId = req.query?.template_id;
        return !templateId
            ? res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "缺少参数: template_id",
                data: {},
                error: {},
            })
            : TemplateConfigService.getTemplateConfig(templateId)
                .then((modifications) => res.status(StatusCodes.OK).json({
                success: true,
                message: "获取模板配置成功",
                data: modifications,
                error: {},
            }))
                .catch((error) => res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || "获取模板配置失败",
                data: {},
                error: error.data || {},
            }));
    }
}
module.exports = TemplateConfigController;
