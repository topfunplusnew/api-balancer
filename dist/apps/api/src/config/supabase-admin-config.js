const { createClient } = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) {
    console.warn("警告: Supabase Admin 配置未设置，请检查环境变量 SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY");
}
const supabaseAdmin = supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })
    : null;
module.exports = supabaseAdmin;
