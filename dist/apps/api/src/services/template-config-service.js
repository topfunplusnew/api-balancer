/**
 * 模板配置服务
 * 返回固定的模板配置结构
 */
class TemplateConfigService {
    /**
     * 获取模板配置
     * @returns {Object} 模板配置对象
     */
    static getTemplateConfig() {
        return {
            name: "template_id",
            type: "select",
            label: "草稿ID",
            options: {
                store: "rpc://getTemplates",
                nested: [
                    {
                        name: "json",
                        type: "text",
                        label: "知识库文件ID",
                        required: true,
                        help: "JSON",
                    },
                ],
            },
            required: true,
            help: "获取草稿信息",
        };
    }
}
module.exports = TemplateConfigService;
