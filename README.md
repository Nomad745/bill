# 智能记账账本

一个基于 Supabase 的现代化记账应用，支持手机号和邮箱登录。

## 功能特性

- 📱 手机号验证码登录（Twilio Verify）
- 📧 邮箱密码登录
- 💰 收入支出记录
- 📊 数据统计图表
- 🎨 现代化玻璃拟态UI
- 📱 响应式设计

## 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **后端**: Supabase (PostgreSQL + Auth + Real-time)
- **短信服务**: Twilio Verify
- **部署**: Vercel

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd 记账项目/app
```

### 2. 配置 Supabase

1. 在 [Supabase Dashboard](https://supabase.com/dashboard) 创建新项目
2. 获取项目 URL 和匿名密钥
3. 更新 `js/config.js` 文件：

```javascript
export const SUPABASE_URL = 'your-project-url';
export const SUPABASE_ANON_KEY = 'your-anon-key';
```

### 3. 配置 Twilio Verify

**重要**: 项目使用 Twilio Verify 进行手机号认证，提供更安全可靠的验证服务。

#### 3.1 创建 Twilio Verify Service

1. 登录 [Twilio Console](https://console.twilio.com/)
2. 进入 **Verify** → **Services**
3. 点击 **"Create a Verify Service"**
4. 配置服务：
   - **Service Name**: `记账应用验证`
   - **Code Length**: `6`
   - **Code Type**: `Numeric`
   - **Delivery Channels**: 选择 `SMS`
   - **Rate Limiting**: 根据需要设置
5. 复制新创建的 **Service SID**

#### 3.2 配置 Supabase 认证

1. 进入 Supabase Dashboard → **Authentication** → **Providers**
2. 找到 **Phone** 部分
3. 启用 **"Enable Phone provider"**
4. 设置 **SMS Provider** 为 **"Twilio Verify"**
5. 填入配置信息：
   - **Twilio Account SID**: 您的 Twilio Account SID
   - **Twilio Auth Token**: 您的 Twilio Auth Token
   - **Twilio Verify Service SID**: 新创建的 Verify Service SID
6. 启用 **"Enable phone confirmations"**
7. 配置 **SMS OTP Settings**:
   - **SMS OTP Expiry**: `60` 秒
   - **SMS OTP Length**: `6` 位
8. 保存配置

### 4. 数据库设置

项目会自动创建必要的数据库表。确保在 Supabase 控制台中：

1. 进入 SQL Editor
2. 运行以下 SQL 创建 `records` 表：

```sql
CREATE TABLE records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('income', 'expense')),
  amount NUMERIC NOT NULL,
  record_date DATE NOT NULL,
  record_time TIME,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 启用行级安全
ALTER TABLE records ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY "Users can view own records" ON records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own records" ON records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own records" ON records
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own records" ON records
  FOR DELETE USING (auth.uid() = user_id);
```

### 5. 本地开发

```bash
# 使用任何静态文件服务器
npx serve .
# 或
python -m http.server 8000
# 或
php -S localhost:8000
```

### 6. 部署到 Vercel

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 配置环境变量（如果需要）
4. 部署完成

## 使用说明

### 手机号登录

1. 输入手机号（支持中国手机号和国际格式）
2. 点击"发送验证码"
3. 输入收到的6位验证码
4. 点击"登录/注册"

### 邮箱登录

1. 输入邮箱地址
2. 输入密码（至少6位）
3. 点击"登录"或"注册"

## 故障排除

### 手机号验证码无法发送

1. **检查 Twilio Verify 配置**:
   - 确认 Verify Service 已创建且状态正常
   - 验证 Service SID 是否正确
   - 检查 Twilio 账户余额

2. **检查 Supabase 配置**:
   - 确认 SMS Provider 设置为 "Twilio Verify"
   - 验证 Account SID 和 Auth Token 正确
   - 检查认证日志

3. **常见错误**:
   - `20003`: 认证失败 - 重新生成 Auth Token
   - `60200`: Verify Service 不存在 - 创建新的 Verify Service
   - `60202`: 验证码错误 - 检查验证码
   - `60204`: 验证码过期 - 重新发送

### 登录失败

1. 检查浏览器控制台是否有错误信息
2. 确认 Supabase 项目配置正确
3. 检查网络连接

## 测试工具

项目提供了测试页面来验证配置：

- `test-auth.html`: 基础认证测试
- `test-twilio.html`: Twilio Verify 配置测试

## 开发说明

### 项目结构

```
app/
├── css/           # 样式文件
├── js/            # JavaScript 文件
├── assets/        # 静态资源
├── index.html     # 主页面
├── login.html     # 登录页面
├── test-auth.html # 认证测试页面
├── test-twilio.html # Twilio 配置测试页面
└── README.md      # 说明文档
```

### 主要文件说明

- `js/auth.js`: 认证相关函数（支持 Twilio Verify）
- `js/database.js`: 数据库操作
- `js/login.js`: 登录页面逻辑
- `js/app.js`: 主应用逻辑

## Twilio Verify 优势

- ✅ **更安全**: 支持多种验证方式
- ✅ **更可靠**: 自动重试和失败处理
- ✅ **更灵活**: 支持自定义验证码设置
- ✅ **更好的用户体验**: 支持多语言和自定义消息
- ✅ **更详细的日志**: 完整的验证过程追踪

## 许可证

MIT License
